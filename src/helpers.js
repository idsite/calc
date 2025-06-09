export function money(val) {
    const rub = new Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(val);
    return rub;
}

export function getPrice(prices, count, withNDS) {
    //if (!prices) {
    //    return 0;
   // }

    const prices2 = [...prices];
    prices2.sort((a,b)=>{
        if (a.min || 0<b.min || 0) {
            return -1;
        } else if (a.min || 0>b.min || 0) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });

    for (let i = 0; i < prices2.length; i++) {
        if (prices2[i].min) {
            if (count>=prices2[i].min) {
                return prices2[i][withNDS ? 'with_nds' : 'without_nds'];
            }
        } else {
            return prices2[i][withNDS ? 'with_nds' : 'without_nds'];
        }
    }
}
