'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Suggestion {
  id: string;
  content: string;
  createdAt: string;
  upVotes: number;
  downVotes: number;
  hidden?: boolean;
}

export function AdminPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        headers: {
          'Authorization': `Basic ${btoa(`admin:${password}`)}`,
        },
      });
      if (!response.ok) throw new Error('获取建议失败');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      toast.error('获取建议列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${password}`)}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('删除失败');
      
      toast.success('建议已删除');
      setSuggestions(suggestions.filter(s => s.id !== id));
    } catch (error) {
      toast.error('删除建议失败');
    }
  };

  const handleToggleHidden = async (id: string, currentHidden: boolean) => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`admin:${password}`)}`,
        },
        body: JSON.stringify({ id, hidden: !currentHidden }),
      });

      if (!response.ok) throw new Error('更新状态失败');
      
      toast.success('建议状态已更新');
      setSuggestions(suggestions.map(s => 
        s.id === id ? { ...s, hidden: !currentHidden } : s
      ));
    } catch (error) {
      toast.error('更新建议状态失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">建议管理</h2>
      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={suggestion.hidden ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>建议 #{suggestion.id}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleHidden(suggestion.id, !!suggestion.hidden)}
                  >
                    {suggestion.hidden ? '显示' : '隐藏'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(suggestion.id)}
                  >
                    删除
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                创建时间: {new Date(suggestion.createdAt).toLocaleString()}
              </p>
              <p className="mt-2">{suggestion.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                赞成: {suggestion.upVotes} | 反对: {suggestion.downVotes}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 