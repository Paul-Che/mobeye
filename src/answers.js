/**
 * We are building an e-commerce website.
 * Our customers can add articles to a virtual cart, purchase it,
 * and we deliver them to their home the next day.
 * The price they are charged with is the sum of the prices of every article
 * in their cart. Prices are expressed in cents.
 * @param {json} data See `./src/level1.json`
 * @return {object}   See `./src/__tests__/__snapshots/level1.js.snap`
 */
export function level1(data) {
  const articles = data.articles;
  const carts = data.carts;

  // Price is a function that render price per article_id
  const price = article_id => {
    return articles.find(article => article.id === article_id ).price;
  }

  // Total is a function that render the total cost amount per cart
  const total = items => {
  	return items.reduce((sum, item) => {
      return sum + item.quantity * price(item.article_id);
    }, 0);
  }

  const results = [];
  carts.forEach((cart) => {
    let result = { id: cart.id, total: total(cart.items) };
    results.push(result);
  });

  return { carts: results };
}

/**
 * The delivery cost depends on the amount of the customers' cart:
 * the more articles they purchase, the less we charge them.
 * @param {json} data See `./src/level2.json`
 * @return {object}   See `./src/__tests__/__snapshots/level2.js.snap`
 */
export function level2(data) {
  const deliveryFees = data.delivery_fees;

  const addFees = cost => {
    if (cost >= deliveryFees.slice(-1)[0].eligible_transaction_volume.min_price) {
    	return 0
    } else {
      return deliveryFees.find(item =>
        item.eligible_transaction_volume.min_price <= cost &&
        item.eligible_transaction_volume.max_price > cost).price;
    }
  }

  const result = level1(data).carts;
  result.forEach((cart) => cart.total += addFees(cart.total));

  return { carts: result };
}

/**
* Some products are on discount because the marketing department made a deal
* with the supplier. There are two kinds of discounts:
* - a direct reduction of the article's price, e.g. you remove 50€
*   from your 300€ caviar tin and pay only 250€
* - a percentage reduction, e.g. you remove 20% from your 5€ fresh cream
*   and pay only 4€
* @param {json} data See `./src/level3.json`
* @return {object}   See `./src/__tests__/__snapshots/level3.js.snap`
 */
export function level3(data) {
  const articles = data.articles;
  const carts = data.carts;
  const deliveryFees = data.delivery_fees;
  const discounts = data.discounts;

  // Price is a function that render price per article_id
  const price = id => {
    return articles.find(article => article.id === id).price;
  }

  // getDiscount is a function that render the discount amout per article
  const getDiscount = (id, price) => {
  	const discount = discounts.find(disc => disc.article_id === id);
    if (discount) {
    	switch(discount.type) {
      case 'amount':
				price = -discount.value;
        break;
      case 'percentage':
        price = -(price * discount.value / 100);
        break;
      default:
        price += 0;
    	}
      return price;
    } else {
    	return 0
    }
  }

  // Total is a function that render the total cost amount per cart
  const total = items => {
  	return items.reduce((sum, item) => {
      const id = item.article_id
      return sum + item.quantity * Math.round(price(id) + getDiscount(id, price(id)));
    }, 0);
  }

  // addFees is a function that render the price of the fee considering total cost
  const addFees = cost => {
    if (cost >= deliveryFees.slice(-1)[0].eligible_transaction_volume.min_price) {
    	return 0
    } else {
      return deliveryFees.find(item => item.eligible_transaction_volume.min_price <= cost &&
                                 item.eligible_transaction_volume.max_price > cost).price;
    }
  }

  const results = [];
  carts.forEach((cart) => {
    let result = { id: cart.id, total: total(cart.items) };
    results.push(result);
  });
  results.forEach((cart) => cart.total += addFees(cart.total));

  return { carts: results };
}
