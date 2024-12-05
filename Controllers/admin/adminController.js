const loadAdminHome = async (req,res) => {
    try {

        return res.render('homePage')
        
    } catch (error) {
        
        console.log('Home page not found');
        res.status(500).send('server error')       

    }
}


module.exports = {
    loadAdminHome
}