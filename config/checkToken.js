import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    let token = req.get('Authorization')
    if(token){
        token = token.split(' ')[1]
        console.log('token', token)
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            req.user = err ? null : decoded.user
            req.exp = err ? null : new Date(decoded.exp * 1000)
        })
        return next()
    } else {
        req.user = null 
        return next()
    }
}