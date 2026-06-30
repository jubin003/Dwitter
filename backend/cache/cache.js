import nodeCache from 'node-cache';

const cache = new nodeCache({stdTTL:60});

export default cache;