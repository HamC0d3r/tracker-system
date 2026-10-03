DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Food', 'Transport', 'Bills', 'Entertainment', 'Other')),
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_expenses_date ON expenses (date DESC);
CREATE INDEX idx_expenses_category ON expenses (category);

INSERT INTO expenses (title, amount, category, date) VALUES
('Weekly Grocery Shopping', 84.50, 'Food', '2026-09-24'),
('Monthly Public Transit Pass', 65.00, 'Transport', '2026-09-25'),
('Electricity & Water Utility Bill', 118.75, 'Bills', '2026-09-26'),
('Weekend Movie & Popcorn', 27.50, 'Entertainment', '2026-09-27'),
('High-Speed Fiber Internet', 55.00, 'Bills', '2026-09-27'),
('Ride Share to Airport', 32.40, 'Transport', '2026-09-28'),
('Team Dinner at Italian Bistro', 48.90, 'Food', '2026-09-29'),
('Music & Video Streaming Subscriptions', 21.98, 'Entertainment', '2026-09-30'),
('Ergonomic Laptop Stand', 39.99, 'Other', '2026-09-30');
