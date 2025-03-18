import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    // 验证请求数据
    if (!content) {
      return NextResponse.json(
        { error: '建议内容不能为空' },
        { status: 400 }
      );
    }

    const id = nanoid();
    const suggestion = {
      id,
      content,
      createdAt: new Date().toISOString(),
      upVotes: 0,
      downVotes: 0,
    };

    // 将建议存储到 Redis
    await redis.hset(`suggestion:${id}`, suggestion);
    // 将建议 ID 添加到有序集合中，使用创建时间作为分数
    await redis.zadd('suggestions:list', {
      score: Date.now(),
      member: id,
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error('创建建议时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 从有序集合中获取所有建议 ID，按时间降序排列
    const suggestionIds = await redis.zrange('suggestions:list', 0, -1, {
      rev: true,
    });

    // 获取所有建议的详细信息
    const suggestions = await Promise.all(
      suggestionIds.map(async (id) => {
        const suggestion = await redis.hgetall(`suggestion:${id}`);
        return suggestion;
      })
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('获取建议列表时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}