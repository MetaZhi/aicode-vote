import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { headers } from 'next/headers';

interface Suggestion {
  id: string;
  content: string;
  createdAt: string;
  upVotes: number;
  downVotes: number;
  hidden?: boolean;
}

type RedisSuggestion = Record<keyof Suggestion, string>;

// 验证管理员权限
async function checkAdminAuth() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }

  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [, password] = credentials.split(':');

  return password === process.env.ADMIN_PASSWORD;
}

// 获取所有建议（包括隐藏的）
export async function GET() {
  try {
    if (!await checkAdminAuth()) {
      return new NextResponse('需要管理员权限', { status: 401 });
    }

    // 从有序集合中获取所有建议 ID，按时间降序排列
    const suggestionIds = await redis.zrange('suggestions:list', 0, -1, {
      rev: true,
    });

    // 获取所有建议的详细信息
    const suggestions = await Promise.all(
      suggestionIds.map(async (id) => {
        const suggestion = await redis.hgetall(`suggestion:${id}`) as RedisSuggestion;
        if (!suggestion || Object.keys(suggestion).length === 0) return null;
        return {
          ...suggestion,
          id,
          upVotes: parseInt(suggestion.upVotes || '0'),
          downVotes: parseInt(suggestion.downVotes || '0'),
          hidden: suggestion.hidden === 'true',
        } as Suggestion;
      })
    );

    // 过滤掉 null 和隐藏的建议
    const visibleSuggestions = suggestions
      .filter((s): s is Suggestion => s !== null && !s.hidden);

    return NextResponse.json(visibleSuggestions);
  } catch (error) {
    console.error('获取建议列表时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// 删除建议
export async function DELETE(request: Request) {
  try {
    if (!await checkAdminAuth()) {
      return new NextResponse('需要管理员权限', { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '建议ID不能为空' },
        { status: 400 }
      );
    }

    // 删除建议数据
    await redis.del(`suggestion:${id}`);
    // 从列表中移除
    await redis.zrem('suggestions:list', id);

    return NextResponse.json({ message: '建议已删除' });
  } catch (error) {
    console.error('删除建议时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// 隐藏/显示建议
export async function PATCH(request: Request) {
  try {
    if (!await checkAdminAuth()) {
      return new NextResponse('需要管理员权限', { status: 401 });
    }

    const { id, hidden } = await request.json();

    if (!id || typeof hidden !== 'boolean') {
      return NextResponse.json(
        { error: '参数无效' },
        { status: 400 }
      );
    }

    // 更新建议的隐藏状态
    await redis.hset(`suggestion:${id}`, { hidden: hidden.toString() });

    return NextResponse.json({ message: '建议状态已更新' });
  } catch (error) {
    console.error('更新建议状态时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
} 