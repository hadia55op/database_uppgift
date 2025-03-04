const Database = require('better-sqlite3');
const db = new Database('webbutiken.db');
db.pragma('foreign_keys = ON');


const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { getProductDetails,getProductById,getProductByName,getproductsByCategory, deleteProductById,updateProduct, getCustomer,updateCustomer, getCustomerOrder} = require('./utilities.js');
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//############# 1 ###############
app.get('/products', (req, res) => {
    res.json(getProductDetails())});
        

//############# 2 ###############

app.get('/products/stats', (req, res) => {
        res.json(getProductsStats())});

//############# 3 ###############

app.get('/products/search', (req, res) => {
const searchField= req.query.name || '';
const descriptionSearchField = req.query.description || '';
 try {
        const products = getProductByName(searchField,descriptionSearchField);// utökad sök funktion flera fält samtidigt
                 
            if (products.length > 0) {
                res.json(products);
                 } else {
                     
                     res.status(404).json({ message: 'No products found matching the searchField' });
                 }
             } catch (error) {
                 console.error('Error fetching products:', error);
                 res.status(500).json({ message: 'Internal Server Error' });  
         }
         })
//############# 4 ###############

app.get('/products/:id', (req, res) => {
    res.send(getProductById(req.params.id))});


//############# 5 ###############
app.get('/products/category/:id', (req, res) => {
    try {
        const category = getproductsByCategory(req.params.id);
        if (category) {
            res.status(200).json(category); 
        } else {
            res.status(404).json({ message: 'category_id not found' }); 
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category_id', error: error.message }); 
    }
});

//############# 6 ###############

app.post('/products', (req, res) => {
    const { product_id,manufacturer_id, name, description, price, stock_quantity } = req.body;
    // condition  check if any of the required fields are falsy.
    if (![product_id, manufacturer_id, name, description, price, stock_quantity].every(Boolean)) {
        return res.status(400).send('All keys and values are required');
      }
      // Insert new product into the products table
    const stmt = db.prepare('INSERT INTO products (product_id,manufacturer_id, name, description, price, stock_quantity) VALUES (?, ?,?,?,?,?)');
    const newProduct = stmt.run(product_id, manufacturer_id, name, description, price, stock_quantity);
    const addedProduct = {
        product_id: newProduct.lastInsertRowid, // SQLite provide this property to add the ID of the inserted product
        manufacturer_id,
        name,
        description,
        price,
        stock_quantity
      };
    
      res.status(201).json(addedProduct);
    });
    
   
//############# 7 ###############


app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { product_id, manufacturer_id, name, description, price, stock_quantity } = req.body;// required fields
    if (!product_id && !manufacturer_id && !name && !description && !price && !stock_quantity) { 
        return res.status(400).send("No fields to update.");
    }
    try {
         if (price <= 50) {
            throw new Error("Price must be greater than 50");// exrtra validation
        }
        const newProduct = updateProduct(id, manufacturer_id, name, description, price, stock_quantity, product_id);
        
        if (newProduct) {
          res.json({ message: "Product updated successfully", product: newProduct });
        }else {
            res.status(404).send("Product not found.");
        }
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).send("An error occurred while updating the product.");
    }
});

//############# 8 ###############

app.delete('/products/:id', (req, res) => {
    res.send(deleteProductById(req.params.id));

});
//############# 9 ###############
app.get(`/customers/:id`,(req, res) =>{
    //res.send(getCustomer(req.params.id))});
    try {
        const customer = getCustomer(req.params.id);
        if (customer.length > 0) {
            res.json(customer);
                 } else {
                     
                     res.status(404).json({ message: 'No customer for this id found ' });
                 }
             } catch (error) {
                 console.error('Error fetching customers:', error);
                 res.status(500).json({ message: 'Internal Server Error' });  
         }
    
});
//############# 10 ###############
app.put('/customers/:Id', (req,res) =>{
    const {Id}= req.params;
     const {email, phone, address} = req.body
     if(Id){
        // Validate email format
     const emailRegex = /\S+@\S+\.\S+/;
    // Regex for email validation
    if (email && !emailRegex.test(email)) {
        return res.status(400).send("Invalid email format");
    }
        if(req.body.email){
             Id.email = req.body.email;
        }
         if(req.body.phone){
            Id.phone = req.body.phone;
        }
        if(req.body.address){
            Id.address = req.body.address;
         }
    } else{
         res.status(404).send("customer not found");
     }
    
    

    res.json(updateCustomer(email,phone,address,Id))
    return updateCustomer(email,phone,address,Id);
} );

//############# 11 ###############

app.get('/customers/:id/orders',(req, res) =>{
    const customer_id = req.params.id;
    try {
        const customer = getCustomerOrder(customer_id);
        if (customer) {
            res.status(200).json(customer); // Return the customer if found
        } else {
            res.status(404).json({ message: 'customer_id not found' }); // If no customeris found
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer_id', error: error.message }); // In case of any error
    }
});

   
//############# 12 ###############

app.get('/reviews/stats', (req, res) => {
    try {
      // SQL query to get average grade per product
      const query = `app
        SELECT p.product_id AS product_id, p.name AS product_name, AVG(r.rating) AS average_grade
        FROM reviews r
        JOIN products p ON r.product_id = p.product_id
        GROUP BY p. product_id;
      `
  
      // Execute the query
      const reviewStats = db.prepare(query).all();
  
      // Return the results as JSON
      res.json(reviewStats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch review stats' });
      }
    });
    
 
