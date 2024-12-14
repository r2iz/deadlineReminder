"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isPast } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

export function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"deadline" | "title">("deadline");
    const [predefinedUsers, setPredefinedUsers] = useState<User[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        fetchPredefinedUsers();
    }, []);

    const fetchPredefinedUsers = async () => {
        return fetch("/api/users").then((response) => {
            response.json().then((data) => {
                setPredefinedUsers(data);
            });
        });
    };

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/tasks");
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            toast({
                title: "エラー",
                description: "タスクの取得に失敗しました。",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async (taskId: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed }),
            });
            if (!response.ok) throw new Error("Failed to update task");
            await fetchTasks();
        } catch (error) {
            toast({
                title: "エラー",
                description: "タスクの更新に失敗しました。",
                variant: "destructive",
            });
        }
    };

    const getUserNames = (userIds: string[]) => {
        return userIds
            .map((id) => {
                const user = predefinedUsers.find((u) => u.id === id);
                return user ? `${user.name} (${user.discordUsername})` : "";
            })
            .filter(Boolean)
            .join(", ");
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (sortBy === "deadline") {
                return (
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                );
            } else {
                return a.title.localeCompare(b.title);
            }
        });
    }, [tasks, sortBy]);

    if (isLoading) {
        return <div className="text-center">読み込み中...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">タスク一覧</h2>
                <Select
                    value={sortBy}
                    onValueChange={(value: "deadline" | "title") =>
                        setSortBy(value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="並び替え" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="deadline">締め切り順</SelectItem>
                        <SelectItem value="title">タイトル順</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {sortedTasks.map((task) => (
                <Collapsible
                    key={task.id}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={task.completed}
                                onCheckedChange={(checked) =>
                                    handleComplete(task.id, checked as boolean)
                                }
                            />
                            <span
                                className={`font-medium ${
                                    task.completed
                                        ? "line-through text-gray-500"
                                        : ""
                                }`}
                            >
                                {task.title}
                            </span>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-2">
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>担当者: {getUserNames(task.assignees)}</p>
                            <p
                                className={`font-medium ${
                                    isPast(new Date(task.deadline)) &&
                                    !task.completed
                                        ? "text-red-500"
                                        : ""
                                }`}
                            >
                                締め切り:{" "}
                                {format(
                                    new Date(task.deadline),
                                    "yyyy年MM月dd日 HH:mm"
                                )}
                            </p>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
}
