// routes/comics.js
const express = require('express');
const router = express.Router();

module.exports = (con) => {
    // API to create a new comic book
    router.post("/", (req, res) => {
        const { book_name, author_name, year_of_publication, price, discount, number_of_pages, condition, description } = req.body;
        con.query(
            "INSERT INTO comics (book_name, author_name, year_of_publication, price, discount, number_of_pages, `condition`, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [book_name, author_name, year_of_publication, price, discount, number_of_pages, condition, description],
            (err, results) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({ error: "Book already exists." });
                    }
                    console.error("MySQL error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                return res.status(200).json({
                    status: "success",
                    message: "Comic created successfully",
                    id: results.insertId

                });
            }
        );
        
    });
    

    // API to update an existing comic book
    router.put("/:id", (req, res) => {
        const comicId = req.params.id;
        const { book_name, author_name, year_of_publication, price, discount, number_of_pages, condition, description } = req.body;
    
        con.query(
            "UPDATE comics SET book_name = ?, author_name = ?, year_of_publication = ?, price = ?, discount = ?, number_of_pages = ?, `condition` = ?, description = ? WHERE id = ?",
            [book_name, author_name, year_of_publication, price, discount, number_of_pages, condition, description, comicId],
            (err, results) => {
                if (err) {
                    console.error("MySQL error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: "Comic not found" });
                }
                return res.status(200).json({ message: "Comic updated successfully" });
            }
        );
    });
    
    // API to delete a comic book
    router.delete("/:id", (req, res) => {
        const comicId = req.params.id;
        con.query("DELETE FROM comics WHERE id = ?", [comicId], (err, results) => {
            if (err) {
                console.error("MySQL error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "Comic not found" });
            }
            return res.status(200).json({ message: "Comic deleted successfully" });
        });
    });

    // API to fetch comic book inventory with pagination, filtering, and sorting
    router.get("/", (req, res) => {
        const { page = 1, limit = 10, author, year, price_min, price_max, condition, sort_by = 'book_name', order = 'asc' } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM comics WHERE 1=1";
        const queryParams = [];

        if (author) {
            query += " AND author_name = ?";
            queryParams.push(author);
        }
        if (year) {
            query += " AND year_of_publication = ?";
            queryParams.push(year);
        }
        if (price_min) {
            query += " AND price >= ?";
            queryParams.push(price_min);
        }
        if (price_max) {
            query += " AND price <= ?";
            queryParams.push(price_max);
        }
        if (condition) {
            query += " AND condition = ?";
            queryParams.push(condition);
        }

        const validSortColumns = ['price', 'year_of_publication', 'book_name'];
        if (validSortColumns.includes(sort_by)) {
            query += ` ORDER BY ${sort_by} ${order === 'desc' ? 'DESC' : 'ASC'}`;
        } else {
            query += " ORDER BY book_name ASC";
        }

        query += " LIMIT ? OFFSET ?";
        queryParams.push(parseInt(limit), parseInt(offset));

        con.query(query, queryParams, (err, results) => {
            if (err) {
                console.error("MySQL error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            con.query("SELECT COUNT(*) as count FROM comics", (err, countResult) => {
                if (err) {
                    console.error("MySQL error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                const totalItems = countResult[0].count;
                const totalPages = Math.ceil(totalItems / limit);

                return res.status(200).json({
                    status: "success",
                    data: results,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems,
                        limit: parseInt(limit)
                    }
                });
            });
        });
    });

    // API to fetch details of a specific comic book by ID
    router.get("/:id", (req, res) => {
        const { id } = req.params;
        con.query(
            "SELECT * FROM comics WHERE id = ?",
            [id],
            (err, results) => {
                if (err) {
                    console.error("MySQL error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: "Comic not found" });
                }

                return res.status(200).json({
                    status: "success",
                    data: results[0]
                });
            }
        );
    });

    return router;
};
