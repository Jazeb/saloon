/**
 * Run this file after calls ends
 */


// const func = require('../utils/schedules');
const get = require('../src/services/product.services');

test('Test After', done => {
    return get.getProducts({}, { id: 657 })
        .then(product => {
            product = product[0];
            let bids = product.bids;
            expect(product.in_session).toBe(false);
            if (product.biddingTickets.length == 0) expect(product.status).toBe('REPOST');
            if (product.biddingTickets.length > 0) {
                expect(product.status).toBe('SOLD');
                bids.sort((a, b) => b.bid_price - a.bid_price);
                expect(bids[0].status).toBe('WON');
                bids.shift();
                bids.every(bid => expect(bid.status).toBe('LOST'));
                done()
            }
            done()
        }).catch(err => expect(err).toBe(null));
        done()
});