'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Suggestion = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  _count: {
    votes: number;
  };
  userVote?: {
    type: 'UP' | 'DOWN';
  };
};

type VoteType = 'UP' | 'DOWN';

export function SuggestionList({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter();
  const [votingId, setVotingId] = useState<string | null>(null);

  const handleVote = async (suggestionId: string, voteType: VoteType) => {
    setVotingId(suggestionId);
    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (!response.ok) {
        throw new Error('投票失败');
      }

      toast.success('投票成功！');
      router.refresh();
    } catch (error) {
      toast.error('投票失败，请稍后重试');
      console.error('投票时出错:', error);
    } finally {
      setVotingId(null);
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无建议，快来提交第一个建议吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <CardHeader>
            <CardTitle>{suggestion.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {new Date(suggestion.createdAt).toLocaleString('zh-CN')}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{suggestion.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={suggestion.userVote?.type === 'UP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote(suggestion.id, 'UP')}
                disabled={votingId === suggestion.id}
              >
                👍 赞成
              </Button>
              <Button
                variant={suggestion.userVote?.type === 'DOWN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote(suggestion.id, 'DOWN')}
                disabled={votingId === suggestion.id}
              >
                👎 反对
              </Button>
            </div>
            <div className="text-sm">
              得分: {suggestion._count?.votes || 0}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}