import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Input,
    Space,
    Table,
    Tag,
    Typography,
    Modal,
    Form,
    InputNumber,
    Upload,
    Popconfirm,
    message,
    Row,
    Col,
    Select,
} from "antd";
import {
    getAllCategory,
} from "../../services/api.service";
import {
    createProduct,
    hideProduct,
    updateProduct,
    getAllProduct
} from "../../services/admin.service";
import {
    UploadOutlined,
    PlusOutlined,
} from "@ant-design/icons";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockFilter, setStockFilter] = useState("all");
    const [visibilityFilter, setVisibilityFilter] = useState("all");

    const [form] = Form.useForm();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getAllProduct();
            setProducts(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Unable to load products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategory();
            setCategories(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Unable to load categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Chuẩn hoá stock + price
    const filteredProducts = useMemo(() => {
        const enhanced = products.map((p) => {
            const totalStock = p.variants?.reduce((sum, v) => {
                return (
                    sum +
                    (v.Inventory?.reduce(
                        (invSum, inv) => invSum + (Number(inv.stock) || 0),
                        0
                    ) || 0)
                );
            }, 0);

            return {
                ...p,
                stock: totalStock,
                price: p.basePrice,
            };
        });

        // search
        const keyword = searchTerm.toLowerCase();
        let result = !searchTerm
            ? enhanced
            : enhanced.filter((product) =>
                [product?.name, product?.category?.name, product?.sku]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(keyword))
            );

        // filter stock
        if (stockFilter === "in") {
            result = result.filter((p) => p.stock > 0);
        } else if (stockFilter === "out") {
            result = result.filter((p) => p.stock <= 0);
        }

        // filter visibility
        if (visibilityFilter === "visible") {
            result = result.filter((p) => p.status === true);
        } else if (visibilityFilter === "hidden") {
            result = result.filter((p) => p.status === false);
        }

        return result;
    }, [products, searchTerm, stockFilter, visibilityFilter]);

    const handleHideProduct = async (id) => {
        try {
            await hideProduct(id);
            message.success("Product hidden successfully");
            fetchProducts();
        } catch (error) {
            console.error("Hide failed", error);
            message.error("Failed to hide product");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (!values.variants || values.variants.length === 0) {
                message.error("Product must have at least one variant");
                return;
            }
            if (selectedProduct) {
                await updateProduct(selectedProduct.id, values);
                message.success("Product updated successfully");
            } else {
                await createProduct(values);
                message.success("Product created successfully");
            }

            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error(error);
            message.error("Failed to save product");
        }
    };



    const columns = [
        {
            title: "Product",
            dataIndex: "name",
            key: "name",
            render: (value) => value || "Not provided",
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category) => category?.name || "Unknown",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (value) =>
                value ? (
                    <Typography.Text strong>
                        {Number(value).toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                        })}
                    </Typography.Text>
                ) : (
                    "-"
                ),
        },
        {
            title: "Stock",
            dataIndex: "stock",
            key: "stock",
        },
        {
            title: "Stock Status",
            key: "stock_status",
            render: (_, record) => {
                const stock = Number(record?.stock) || 0;
                return (
                    <Tag color={stock > 0 ? "green" : "red"}>
                        {stock > 0 ? "Active" : "Out of stock"}
                    </Tag>
                );
            },
        },
        {
            title: "Visibility",
            key: "visibility",
            render: (_, record) => {
                return (
                    <Tag color={record?.status ? "blue" : "red"}>
                        {record?.status ? "Visible" : "Hidden"}
                    </Tag>
                );
            },
        },

        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => {
                            setSelectedProduct(record);
                            setIsModalOpen(true);

                            form.setFieldsValue({
                                name: record.name,
                                description: record.description,
                                basePrice: record.basePrice,
                                category_id: record.category_id,
                                productImg: record.image
                                    ? [
                                        {
                                            uid: "-1",
                                            name: record.image,
                                            status: "done",
                                            url: `${import.meta.env.VITE_BACKEND_URL}/product/${record.image}`, // preview image
                                        },
                                    ]
                                    : [],
                                variants: record.variants.map((v) => ({
                                    id: v.id,
                                    color: v.color,
                                    storage: v.storage,
                                    price: v.price,
                                    stock: v.Inventory?.[0]?.stock || 0,
                                    status: Boolean(v.status),
                                })),
                            });
                        }}
                    >
                        Edit
                    </Button>

                    <Popconfirm
                        title={record.status ? "Hide product" : "Unhide product"}
                        description={
                            record.status
                                ? "Are you sure you want to hide this product?"
                                : "Are you sure you want to unhide this product?"
                        }
                        onConfirm={() => handleHideProduct(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger={!record.status}>
                            {record.status ? "Hide" : "Unhide"}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-products">
            <Typography.Title level={3}>Product management</Typography.Title>

            {/* search - button add product */}
            <Space style={{ marginBottom: 16, flexWrap: "wrap" }} size={[16, 16]}>
                <Input.Search
                    placeholder="Search by product name or category"
                    allowClear
                    onSearch={setSearchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                    style={{ maxWidth: 420 }}
                />

                <Select
                    value={stockFilter}
                    onChange={setStockFilter}
                    options={[
                        { label: "All Stock", value: "all" },
                        { label: "In Stock", value: "in" },
                        { label: "Out of Stock", value: "out" },
                    ]}
                    style={{ width: 150 }}
                />

                <Select
                    value={visibilityFilter}
                    onChange={setVisibilityFilter}
                    options={[
                        { label: "All Visibility", value: "all" },
                        { label: "Visible", value: "visible" },
                        { label: "Hidden", value: "hidden" },
                    ]}
                    style={{ width: 150 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setSelectedProduct(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Add Product
                </Button>

            </Space>


            <Table
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={filteredProducts}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={isModalOpen}
                title={selectedProduct ? "Edit Product" : "Add Product"}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        Save changes
                    </Button>,
                ]}
                width={900}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="basePrice"
                                label="Base Price"
                                rules={[{ required: true }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    formatter={(val) =>
                                        `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="category_id"
                                label="Category"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Select category">
                                    {categories.map((category) => (
                                        <Select.Option
                                            key={category.category_id}
                                            value={category.category_id}
                                        >
                                            {category.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Image"
                        name="productImg"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e && e.fileList}
                    >
                        <Upload
                            name="productImg"
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1} // chỉ giữ 1 ảnh
                        >
                            <Button icon={<UploadOutlined />}>Upload New Image</Button>
                        </Upload>
                    </Form.Item>

                    <Typography.Title level={5}>Variants</Typography.Title>
                    <Form.List name="variants">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{ display: "flex", marginBottom: 8 }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            name={[name, "color"]}
                                            fieldKey={[fieldKey, "color"]}
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="Color" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, "storage"]}
                                            fieldKey={[fieldKey, "storage"]}
                                        >
                                            <Input placeholder="Storage" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, "price"]}
                                            fieldKey={[fieldKey, "price"]}
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber placeholder="Price" min={0} />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, "stock"]}
                                            fieldKey={[fieldKey, "stock"]}
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber placeholder="Stock" min={0} />
                                        </Form.Item>

                                        <Form.Item name={[name, "status"]} rules={[{ required: true }]}>
                                            <Select style={{ width: 120 }}>
                                                <Select.Option value={true}>Visible</Select.Option>
                                                <Select.Option value={false}>Hidden</Select.Option>
                                            </Select>
                                        </Form.Item>


                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add({ status: 1 })} // default Visible
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Add Variant
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;
