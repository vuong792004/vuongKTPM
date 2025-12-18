import { useEffect, useState } from "react";
import { Button, Card, List, Space, Tag, Typography } from "antd";
import { getAllCategory } from "../../services/api.service";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isSubscribed = true;

        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await getAllCategory();
                if (!isSubscribed) return;

                setCategories(Array.isArray(response?.data) ? response.data : []);
            } catch (error) {
                console.error("Unable to load categories:", error);
                if (isSubscribed) {
                    setCategories([]);
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            isSubscribed = false;
        };
    }, []);

    return (
        <div className="admin-categories">
            <Typography.Title level={3}>Category management</Typography.Title>
            <Typography.Paragraph>
                Keep the category structure organised to help customers find products.
            </Typography.Paragraph>

            <List
                grid={{ gutter: 16, column: 2 }}
                loading={loading}
                dataSource={categories}
                locale={{ emptyText: "No categories available." }}
                renderItem={(category) => (
                    <List.Item>
                        <Card>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Typography.Title level={5} style={{ margin: 0 }}>
                                    {category?.name || "Untitled category"}
                                </Typography.Title>
                                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                    {category?.description || "This category does not have a description yet."}
                                </Typography.Paragraph>
                                <Space>
                                    <Tag color="blue">ID: {category?._id || category?.id || "N/A"}</Tag>
                                    {category?.slug && <Tag color="purple">Slug: {category.slug}</Tag>}
                                </Space>
                                <Space>
                                    <Button type="link">Edit</Button>
                                    <Button type="link" danger>
                                        Delete
                                    </Button>
                                </Space>
                            </Space>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default CategoryManagement;