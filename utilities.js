const Database = require('better-sqlite3');


const db = new Database('webbutiken.db');
//############# 1 ###############
function getProductDetails() {
    try {
      // SQL query with JOIN to include manufacturer and category info
      const query = ` SELECT 
    p.product_id AS product_id, 
    p.name AS product_name,
     ROUND(p.price, 2) AS product_price,
    p.description,
    c.name AS category_name,
    m.name AS manufacturer_name 
    FROM products p
    JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
    JOIN products_categories pc ON p.product_id = pc.product_id
    JOIN categories c ON pc.category_id = c.category_id;
        
      `;
      const products = db.prepare(query).all(); // Execute the query
      return products; // Return the result
    }catch (err){
        console.error('failed to gett all the products', err);
    }
  }
 //############# 2 ###############
function getProductsStats() {
    try {
            const resultStats = ( `  SELECT c.name AS category_name,
         COUNT(DISTINCT p.product_id) AS total_products,
         AVG(p.price) AS average_price
FROM categories c
LEFT JOIN products_categories pc ON c.category_id = pc.category_id
LEFT JOIN products p ON pc.product_id = p.product_id
GROUP BY c.category_id;

            `)
            const productStats = db.prepare(resultStats).all();
            // Send the result as JSON response
            res.json(productStats);
        } catch (error) {
         res.status(500).json({ error: 'Internal server error' });
        }
    }
      
//############# 3 ###############
function getProductByName(searchField) {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?)  OR LOWER(description) LIKE LOWER(?)');
        const products = stmt.all(`${searchField}`, `${searchField}`);
        return products;
    } catch (error) {

        throw new Error('Error searching for products');
    }
}
//############# 4 ###############
function getProductById(product_id) {
    try{const stmt = db.prepare('SELECT * FROM products WHERE product_id = ?');
    return stmt.get(product_id);
    }
 catch (error) {

    throw new Error('Error searching for products');

}
}
//############# 5 ###############
function getproductsByCategory(category_id) {
    const stmt = db.prepare(`
        SELECT p.product_id ,
        p.name ,
        p.price,
        c.name AS category_name
    FROM products p
    INNER JOIN products_categories pc ON p.product_id = pc.product_id
    INNER JOIN categories c ON c.category_id = pc.category_id
        
        
    WHERE pc.category_id = ?

    `);
    
    // we Use .all() to get all matching products
    return stmt.all(category_id);
}
//############# 6 in  server.js ###############

//############# 7 ###############
function updateProduct(product_id, manufacturer_id, name, description, price, stock_quantity, new_id) {
    try {
       
        //  Update the product with the new values, setting product_id to the new_id
        const stmt = db.prepare('UPDATE products SET product_id = ?, manufacturer_id = ?, name = ?, description = ?, price = ?, stock_quantity = ? WHERE product_id = ?');
        
        return stmt.run(new_id, manufacturer_id, name, description, price, stock_quantity, product_id);
    } catch (err) {
        console.error('Failed to update product: ', err);
    }
}
//############# 8 ###############
function deleteProductById(product_id){
    const stmt = db.prepare('DELETE FROM products WHERE product_id = ?');
    return stmt.run(product_id);
}


//############# 9 ###############
  function getCustomer(customer_id){
    const stmt = db.prepare(`SELECT 
   * FROM customers AS c
INNER JOIN orders AS o ON o.customer_id = c.customer_id
WHERE c.customer_id = ?
  `)
        return stmt.all(customer_id);
}
//############# 10 ###############
function updateCustomer(email, phone,address, customer_id){
    try{
       
        const stmt = db.prepare('UPDATE customers SET email = ?, phone = ? , address = ? WHERE customer_id = ?');
        return stmt.run(email, phone, address, customer_id);
        

    } catch(err){
        console.error('failed to update customer: ', err);
    }

}
//############# 11 ###############

function getCustomerOrder(customer_id){
    const stmt = db.prepare(`SELECT * FROM orders WHERE customer_id = ?`)
    return stmt.all(customer_id);
}

//############# 12 in server.js ###############




module.exports = {getProductDetails,getProductsStats,getProductById, getProductByName,getproductsByCategory,deleteProductById, updateProduct,getCustomer, updateCustomer, getCustomerOrder };