import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Input,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    Form,
    message,
    Upload,
    Avatar,
    Popconfirm,
} from "antd";
import { disableUser, getAllUsers, updateUser } from "../../services/admin.service";
import { UploadOutlined } from "@ant-design/icons";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Unable to load users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch = normalizedSearch
                ? [user.name, user.email, user.role]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedSearch))
                : true;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && user.status === "ACTIVE") ||
                (statusFilter === "inactive" && user.status === "DISABLED");

            const matchesRole = roleFilter === "all" || user.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [users, searchTerm, statusFilter, roleFilter]);

    const handleToggleActive = async (userId, currentStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, status: newStatus } : user
            )
        );
        await disableUser(userId);
    };

    const handleEdit = (record) => {
        setSelectedUser(record);
        setIsModalOpen(true);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            address: record.address,
            role: record.role,
            status: record.status,
            phone: record.phone || "",
            avatar: record.avatar
                ? [
                    {
                        uid: "-1",
                        name: record.avatar,
                        status: "done",
                        url: `${import.meta.env.VITE_BACKEND_URL}/avatar/${record.avatar}`,
                    },
                ]
                : [],
        });
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            await updateUser(selectedUser.id, values);
            message.success("User updated successfully!");
            setIsModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            message.error("Update failed!");
        }
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (value) => value || "—",
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            render: (value) => value || "—",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (value) => <Tag color="blue">{value}</Tag>,
        },
        {
            title: "Joined",
            dataIndex: "created_at",
            key: "joinedAt",
            render: (value) =>
                value
                    ? new Date(value).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })
                    : "—",
        },
        {
            title: "Active",
            key: "active",
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure?"
                    description={`Do you really want to ${record.status === "ACTIVE" ? "disable" : "activate"} this user?`}
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleToggleActive(record.id, record.status)}
                >
                    <Switch
                        checked={record.status === "ACTIVE"}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                    />
                </Popconfirm>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-users">
            <Typography.Title level={3}>User management</Typography.Title>

            <Space style={{ marginBottom: 16 }} size={[16, 16]}>
                <Input.Search
                    placeholder="Search by name, email, or role"
                    allowClear
                    enterButton="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onSearch={setSearchTerm}
                    style={{ minWidth: 260 }}
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: "All statuses", value: "all" },
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                    ]}
                    style={{ width: 160 }}
                />
                <Select
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                        { label: "All roles", value: "all" },
                        { label: "Admin", value: "admin" },
                        { label: "Customer", value: "customer" },
                    ]}
                    style={{ width: 160 }}
                />
            </Space>

            <Table
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={filteredUsers}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: "No users found." }}
            />

            <Modal
                open={isModalOpen}
                title="Edit User"
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                onOk={handleUpdate}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter name" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Please enter email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Avatar"
                        name="avatar"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                    >
                        <Upload
                            name="avatar"
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Upload New Avatar</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Address" name="address">
                        <Input />
                    </Form.Item>

                    {/* Phone và Role chung hàng */}
                    <Form.Item>
                        <Space style={{ display: "flex" }}>
                            <Form.Item
                                label="Phone"
                                name="phone"
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Role"
                                name="role"
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <Select
                                    options={[
                                        { label: "Admin", value: "admin" },
                                        { label: "Customer", value: "customer" },
                                    ]}
                                />
                            </Form.Item>
                        </Space>
                    </Form.Item>

                    <Form.Item label="Status" name="status">
                        <Select
                            options={[
                                { label: "Active", value: "ACTIVE" },
                                { label: "Disabled", value: "DISABLED" },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
};

export default UserManagement;
