import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getAccounts, updateAccount } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCog, Search } from "lucide-react";

const mapAccount = (item) => ({
  id: item.account_id,
  email: item.email || "",
  createdAt: item.created_at || "",
  isAdmin: Number(item.is_admin) === 1 ? 1 : 0,
  isDisabled: Number(item.is_disabled) === 1 ? 1 : 0,
  role: Number(item.is_admin) === 1 ? "Admin" : "User",
});

const roleBadgeClass = (role) =>
  role === "Admin"
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-700";

export default function AccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts((res?.data || []).map(mapAccount));
    } catch (error) {
      console.error("Fetch accounts error:", error);
      toast.error(error.message || "Không thể tải danh sách");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return accounts.filter(
      (item) =>
        item.email.toLowerCase().includes(keyword) ||
        item.role.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
    );
  }, [accounts, search]);

  const handleToggleLock = async (item) => {
    const next = item.isDisabled ? 0 : 1;

    try {
      await updateAccount(item.id, {
        is_admin: item.isAdmin,
        is_disabled: next,
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === item.id
            ? {
                ...acc,
                isDisabled: next,
              }
            : acc
        )
      );

      toast.success(next ? "Đã khóa" : "Đã mở khóa");
    } catch (error) {
      console.error("Toggle lock error:", error);
      toast.error(error.message || "Lỗi cập nhật");
    }
  };

  const stats = [
    { label: "Tổng tài khoản", value: accounts.length },
    {
      label: "Admin",
      value: accounts.filter((item) => item.isAdmin === 1).length,
    },
    {
      label: "User",
      value: accounts.filter((item) => item.isAdmin === 0).length,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang tài khoản</h1>

      <div className="relative w-64">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Tìm..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr className="text-left">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Quyền</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b transition ${
                    item.isDisabled
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <td className="px-6 py-4">{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        {item.isAdmin === 1 ? (
                          <ShieldCheck className="text-blue-600" />
                        ) : (
                          <UserCog className="text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{item.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge className={roleBadgeClass(item.role)}>
                      {item.role}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {item.isAdmin !== 1 && (
                      <button
                        onClick={() => handleToggleLock(item)}
                        className={`ml-auto flex h-6 w-12 items-center rounded-full p-1 transition ${
                          item.isDisabled ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow transition ${
                            item.isDisabled ? "translate-x-0" : "translate-x-6"
                          }`}
                        />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && (
            <div className="p-6 text-center">Không có dữ liệu</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}