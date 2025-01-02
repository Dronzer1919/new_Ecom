
export const EndPoints = {
    APIURL: {
        // authetication APIs
        register: '{0}/auth/register',
        login: '{0}/auth/login',
        verifyEmail: '{0}/auth/verifyEmail',
        verifyOTP: '{0}/auth/verifyOTP',
        setNewPassword: '{0}/auth/setNewPassword',
        checkEmailExistence: '{0}/auth/checkEmail', 
        // 
        addProduct: '{0}/products/create-products',
        getAllProduct: '{0}/products/getAllProduct',
        // deleteProduct: '{0}/deleteProduct',
        deleteProduct: '{0}/products/deleteProduct/{1}',
        editProduct: '{0}/products/editProduct/{1}',
        addType: '{0}/products/addtypes',


        //users 
        addUser: '{0}/users/create',
        getAllUsers: '{0}/users/all',
        getUserById: '{0}/users/{1}', 
        updateUser: '{0}/users/update/{1}',
        deleteUser: '{0}/users/delete/{1}',  
        checkEmail: '{0}/users/check-email',
        adminlogin: '{0}/users/login',


    },

}