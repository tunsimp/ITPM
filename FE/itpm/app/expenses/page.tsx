"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Money, MoneyType, createMoney, getAllMoney, updateMoney, deleteMoney } from "@/lib/money"
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

export default function ExpensesPage() {
    const [items, setItems] = useState<Money[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Money | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        type: MoneyType.EXPENSE,
        description: "",
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const data = await getAllMoney()
            setItems(data)
        } catch (error) {
            console.error("Failed to fetch money items:", error)
            toast.error("Failed to load expenses and income")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingItem) {
                await updateMoney(editingItem.id, {
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    description: formData.description || undefined,
                })
                toast.success("Item updated successfully")
            } else {
                await createMoney({
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    description: formData.description || undefined,
                })
                toast.success("Item added successfully")
            }
            setIsDialogOpen(false)
            resetForm()
            fetchItems()
        } catch (error) {
            console.error("Failed to save item:", error)
            toast.error(editingItem ? "Failed to update item" : "Failed to add item")
        }
    }

    const handleEdit = (item: Money) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            amount: item.amount.toString(),
            type: item.type,
            description: item.description || "",
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return
        try {
            await deleteMoney(id)
            toast.success("Item deleted successfully")
            fetchItems()
        } catch (error) {
            console.error("Failed to delete item:", error)
            toast.error("Failed to delete item")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            amount: "",
            type: MoneyType.EXPENSE,
            description: "",
        })
        setEditingItem(null)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        resetForm()
    }

    const expenses = items.filter((item) => item.type === MoneyType.EXPENSE)
    const income = items.filter((item) => item.type === MoneyType.INCOME)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpenses

    const getTypeColor = (type: MoneyType) => {
        return type === MoneyType.INCOME
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
    }

    if (loading) {
        return (
            <ProtectedLayout>
                <div className="p-8">Loading...</div>
            </ProtectedLayout>
        )
    }

    return (
        <ProtectedLayout>
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Expenses & Income</h1>
                        <p className="text-muted-foreground mt-2">Track your financial transactions</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Type</label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value as MoneyType })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MoneyType.EXPENSE}>Expense</SelectItem>
                                            <SelectItem value={MoneyType.INCOME}>Income</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Groceries, Salary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Amount</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add a note..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {totalIncome.toLocaleString('vi-VN')} ₫
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {totalExpenses.toLocaleString('vi-VN')} ₫
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance</CardTitle>
                            <div className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {balance >= 0 ? <TrendingUp /> : <TrendingDown />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {balance.toLocaleString('vi-VN')} ₫
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No transactions yet. Add your first expense or income!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border">
                                        <tr>
                                            <th className="text-left py-2 font-medium">Type</th>
                                            <th className="text-left py-2 font-medium">Name</th>
                                            <th className="text-left py-2 font-medium">Amount</th>
                                            <th className="text-left py-2 font-medium">Description</th>
                                            <th className="text-left py-2 font-medium">Date</th>
                                            <th className="text-right py-2 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((item) => (
                                                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                                                    <td className="py-3">
                                                        <Badge className={getTypeColor(item.type)} variant="outline">
                                                            {item.type === MoneyType.INCOME ? "Income" : "Expense"}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 font-medium">{item.name}</td>
                                                    <td className={`py-3 font-medium ${item.type === MoneyType.INCOME ? "text-green-600" : "text-red-600"}`}>
                                                        {item.type === MoneyType.INCOME ? "+" : "-"}{item.amount.toLocaleString('vi-VN')} ₫
                                                    </td>
                                                    <td className="py-3 text-muted-foreground">{item.description || "-"}</td>
                                                    <td className="py-3 text-muted-foreground">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(item)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedLayout>
    )
}

