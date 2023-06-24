export type SuperinvestorsEntryT = {
    manager: string;
    stock: string;
    period: string;
    shares: string;
    percentage_of_portfolio: string;
    activity: string
    percentage_change_to_portfolio: string;
    reported_price: string;
};


export type SuperinvestorsDesiredEntryT = {
    manager: string;
    stock: string;
    period: string;
    shares: string;
    percentage_of_portfolio: string;
    direction: string;
    distance: string;
    percentage_change_to_portfolio: string;
    reported_price: string;
  };