"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type User } from "@/types/user";

export function CreateTaskModal() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [assignees, setAssignees] = useState<string[]>([]);
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState("");
    const [predefinedUsers, setPredefinedUsers] = useState<User[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        const deadline = new Date(date);
        const [hours, minutes] = time.split(":");
        deadline.setHours(parseInt(hours, 10), parseInt(minutes, 10));

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                assignees,
                deadline: deadline.toISOString(),
            }),
        });
        if (response.ok) {
            setOpen(false);
            setTitle("");
            setAssignees([]);
            setDate(undefined);
            setTime("");
            // タスクリストを更新する処理をここに追加
        }
    };

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                setPredefinedUsers(data);
            });
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">新しいタスクを作成</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>新しいタスク</DialogTitle>
                    <DialogDescription>
                        新しいタスクの詳細を入力してください。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">タイトル</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>担当者</Label>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {predefinedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-2 p-2"
                                >
                                    <input
                                        type="checkbox"
                                        id={`user-${user.id}`}
                                        checked={assignees.includes(user.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setAssignees([
                                                    ...assignees,
                                                    user.id,
                                                ]);
                                            } else {
                                                setAssignees(
                                                    assignees.filter(
                                                        (id) => id !== user.id
                                                    )
                                                );
                                            }
                                        }}
                                        className="form-checkbox h-4 w-4 text-primary"
                                    />
                                    <label
                                        htmlFor={`user-${user.id}`}
                                        className="text-sm"
                                    >
                                        {user.name} ({user.discordUsername})
                                    </label>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="space-y-2">
                        <Label>締め切り</Label>
                        <div className="flex space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            format(date, "PPP")
                                        ) : (
                                            <span>日付を選択</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="w-[120px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">作成</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
