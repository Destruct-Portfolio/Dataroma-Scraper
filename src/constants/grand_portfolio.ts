export const BASE_URL = "https://www.dataroma.com/m/g/portfolio.php?L="
export const SELECTORS = {
    max_pages: "#pages > a:nth-last-child(2)",
    list: "#grid > tbody > tr",
        elements: {
            symbol: "td.sym > a",
            stock: "td.stock > a",
            percentage: "td:nth-child(3)",
            ownership_count: "td:nth-child(4)",
            hold_price: "td:nth-child(5)",
            max_percentage: "td:nth-child(6)",
            current_price: "td:nth-child(7)",
            _52_week_low: "td:nth-child(8)",
            percentage_above_52_week_low: "td:nth-child(9)",
            _52_week_high: "td:nth-child(10)"
        }
}