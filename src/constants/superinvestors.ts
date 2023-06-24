export const SELECTORS = {
    shared: "#grid > tbody > tr",
    1: {
        elements: {
            manager: "td.man > a"
        }
    },
    2: {
        elements: {
            stock: "td.stock > a",
            history: "td.hist > a"
        }
    },
    3: {
        elements: {
            period: "td:nth-child(1)",
            shares: "td:nth-child(2)",
            percentage_of_portfolio: "td:nth-child(3)",
            activity: "td:nth-child(4)",
            percentage_change_to_portfolio: "td:nth-child(5)",
            reported_price: "td:nth-child(6)",
        }
    }
}