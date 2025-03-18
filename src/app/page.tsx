'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Suggestion {
  id: string;
  content: string;
  createdAt: string;
  upVotes: number;
  downVotes: number;
}

export default function Home() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(true);

  // 获取建议列表
  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('获取建议列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提交新建议
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newSuggestion }),
      });
      if (response.ok) {
        setNewSuggestion('');
        fetchSuggestions();
      }
    } catch (error) {
      console.error('提交建议失败:', error);
    }
  };

  // 投票
  const handleVote = async (id: string, type: 'UP' | 'DOWN') => {
    try {
      const response = await fetch(`/api/suggestions/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId: 'test-user', // 临时使用测试用户ID
        }),
      });
      if (response.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">直播主题建议</h1>
      
      {/* 提交建议表单 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>提交新建议</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="输入您的建议..."
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit">提交建议</Button>
          </form>
        </CardContent>
      </Card>

      {/* 建议列表 */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardContent className="pt-6">
              <p className="mb-4">{suggestion.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(suggestion.id, 'UP')}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {suggestion.upVotes}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote(suggestion.id, 'DOWN')}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {suggestion.downVotes}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
