import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: suggestionId } = await params;
    const body = await request.json();
    const { type, userId } = body;

    // 验证请求数据
    if (!type || !['UP', 'DOWN'].includes(type)) {
      return NextResponse.json( 
        { error: '投票类型无效' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    // 检查建议是否存在
    const suggestion = await redis.hgetall(`suggestion:${suggestionId}`);

    if (!suggestion || !suggestion.id) {
      return NextResponse.json(
        { error: '建议不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已经投过票
    const userVoteKey = `votes:${suggestionId}:${userId}`;
    const existingVote = await redis.get(userVoteKey);

    if (existingVote) {
      if (existingVote === type) {
        return NextResponse.json(
          { error: '您已经投过这个票了' },
          { status: 400 }
        );
      }
      // 如果用户改变投票
      if (existingVote === 'UP') {
        await redis.hincrby(`suggestion:${suggestionId}`, 'upVotes', -1);
      } else {
        await redis.hincrby(`suggestion:${suggestionId}`, 'downVotes', -1);
      }
    }

    // 记录新的投票
    await redis.set(userVoteKey, type);

    // 更新投票计数
    if (type === 'UP') {
      await redis.hincrby(`suggestion:${suggestionId}`, 'upVotes', 1);
    } else {
      await redis.hincrby(`suggestion:${suggestionId}`, 'downVotes', 1);
    }

    // 获取更新后的建议数据
    const updatedSuggestion = await redis.hgetall(`suggestion:${suggestionId}`);

    return NextResponse.json({
      message: '投票成功',
      suggestion: updatedSuggestion,
    }, { status: 200 });
  } catch (error) {
    console.error('投票时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}