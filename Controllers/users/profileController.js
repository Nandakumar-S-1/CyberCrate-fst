


const forgotPassword = async(req,res)=>{
    try {
        
        res.render('forgotPassword')

    } catch (error) {
        res.redirect('/404-error')
    }
}

module.exports = {
    forgotPassword
}