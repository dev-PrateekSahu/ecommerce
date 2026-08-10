const getProducts = (req, res) => {
    const products = [
        {
            id: 1,
            name: "iPhone 15",
            price: 60000
        },
        {
            id: 2,
            name: "Nike Shoes",
            price: 5000
        }
    ];

    res.json({
        success: true,
        products
    });
};

module.exports = {
    getProducts
};