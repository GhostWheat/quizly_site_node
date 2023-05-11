module.exports = (req, res) => {
    res.cookie('JWT', '', { maxAge: 900000, httpOnly: true })
    res.redirect('/auth/login')
}