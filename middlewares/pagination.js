module.exports = {
    pagination: async(req, res, next) => {
        page = parseInt(req.query.p) - 1
        limit = 3
        skip = limit * page

        let products = await productHelpers.getPaginatedResults(limit, skip)
    }
}

