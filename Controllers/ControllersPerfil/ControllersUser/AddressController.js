var mongoose = require("mongoose");

//Models
const User = require("../../../Models/Perfils/User.js");
const AddressOrder = require("../../../Models/Orders/AddressOrder.js");
const Address = require("../../../Models/Address.js");

//Funcoes
const { validarMorada } = require("../../Functions/APImoradas.js")

//Controllers
var addressController = {};

//Variaveis Constantes
const maxAddress = 5;

/**
 * * Metodo que carrega todas as moradas de um utilizador
 * */
addressController.getAddresses = function(req, res) {
    const userId = req.params.userId;
    console.log("Paramentros: ", req.params);

    User.findById(userId).exec()
        .then(user => {
            console.log("Utilizador encontrado: ", user);
            if (!user) {
                return res.status(404).json({ error: "O utilizador não foi encontrado" });
            }

            const address = user.addresses;
            if(!address) {
                return res.status(404).json({ error: "User não tem moradas" });
            }

            res.status(200).json(address);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({error: error });
        });
}

/**
 * * Metodo que vai buscar todas as moradas de um utilizador
 * */
addressController.getAddress = function(req, res) {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    User.findOne(
        { 
            _id: userId,
            'addresses._id': addressId 
        },
        { 
            'addresses.$': 1,
        }
    ).exec()
        .then(userAddress => {
            if (!userAddress) {
                return res.status(404).json({ error: "Utilizador não encontrado ou não possui nenhuma morada registada" });
            }
    
            const addresses = userAddress.addresses;
            if (!addresses || addresses.length === 0) {
                return res.status(404).json({ error: "Morada do utilizador não encontrada" });
            }
    
            const address = addresses[0];
            res.status(200).json(address);
        })
        .catch(error => {
            console.error("Error fetching user:", error);
            res.status(500).json({error: error});
        });
}

function validateUserFind(user) {
    if(!user) {
        return "O utilizador não foi encontrado";
    }

    if(!user.addresses) {
        return "User não tem moradas";
    }

    return "";
}

async function validateCamposAddress(nif, street, postal_code, city) {
    if (!street || !postal_code || !city) {
        return "Algum dos campos de preenchimento obrigatorio está por preencher"
    }

    if (street.length > 250) {
        return "O numero de caracteres da morada excede o numero de caracteres permitidos";
    }

    if (city.length > 100) {
        return "O numero de caracteres da cidade excede o numero de caracteres permitidos"
    }

    const regex = /^\d{4}-\d{3}$/;
    if (!(regex.test(postal_code))) {
        return "O formato do código postal é inválido";
    }

    const validateMorada = await validarMorada(street, postal_code, city);
    if (!validateMorada.valido) {
        return "A morada introduzida não é válida";
    }
    

    if (nif && (nif < 100000000 || nif > 999999999)) {
        return "O nif introduzido é invalido";
    }

    return "";
}

function isDuplicateAddress(addresses, addressId, nif, street, postal_code, city) {
    let error = "";
    let i = 0;
    let duplicate = false;

    while (i < addresses.length && !duplicate) {
        const current = addresses[i];
        const sameAddress = (
            current.nif === nif &&
            current.address.street.trim().toLowerCase() === street.trim().toLowerCase() &&
            current.address.postal_code.trim() === postal_code.trim() &&
            current.address.city.trim().toLowerCase() === city.trim().toLowerCase()
        );

        if (sameAddress) {
            duplicate = true;
        }
        
        i++;
    }

    if (duplicate) {
        error = "O morada que está a tentar introduzir já existe!";
    }

    return error;
}

/* Página que cria uma nova morada (limite de moradas é 5) */
addressController.createAddress = async function(req, res) {
    try {
        const userId = req.params.userId;
        let user = await User.findById(userId).exec();
        
        const errorsUser = validateUserFind(user);
        if (errorsUser !== "") {
            return res.status(404).json({error: errorsUser});
        }

        const addresses = user.addresses; 
        if (addresses.length >= maxAddress) {
            return res.status(409).json({error: "Não pode introduzir mais moradas, o limite de moradas foi atingido (limite: 5)"});
        }

        const {nif, address} = req.body;

        const street = address.street;
        const postal_code = address.postal_code;
        const city = address.city;
        const errosCampos = await validateCamposAddress(nif, street, postal_code, city);
        
        if (errosCampos !== "") {
            return res.status(422).json({error: errosCampos});
        }

        const errorDuplicateAddress = isDuplicateAddress(addresses, nif, street, postal_code, city);
        if (errorDuplicateAddress !== "") {
            return res.status(422).json({error: errorDuplicateAddress});
        }

        const addressOrder = new AddressOrder({
            address: address
        });

        if (nif) {
            addressOrder.nif = nif;
        }        

        user.addresses.push(addressOrder);
        await user.save();

        res.status(200).json(user.addresses);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({error: error });
    }
}

function findAddress(addresses, addressId) {
    let i = 0;
    let found = false;

    while (addresses.length && !found) {
        if (addresses[i]._id.toString() === addressId) {
            found = true;
        } else {
            i++;
        }
    }

    if (!found) {
        i = -1;
    }
    return i;
}
/**
 * * Metodo que edita os dados de uma morada já existente
 * */
addressController.editAddress = async function(req, res) {
    try {
        const userId = req.params.userId;
        const addressId = req.params.addressId;
        let user = await User.findById(userId).select({addresses: 1}).exec();
        
        console.log("Utilizador encontado: ", user);
        const errorsUser = validateUserFind(user);
        if (errorsUser !== "") {
            return res.status(404).json({error: errorsUser});
        }

        const addresses = user.addresses;
        const posAddress = findAddress(addresses, addressId);
        if (posAddress === -1) {
            return res.status(404).json({error: "A morada introduzida não foi encontada"});
        } 

        const addressOrder = addresses[posAddress];
        const {nif, address} = req.body;
        const street = address.street;
        const postal_code = address.postal_code;
        const city = address.city;
        console.log("Body: ", req.body);
        const errosCampos = await validateCamposAddress(nif, street, postal_code, city);
        
        if (errosCampos !== "") {
            console.log("Error: ", errosCampos)
            return res.status(422).json({error: errosCampos});
        }

        const errorDuplicateAddress = isDuplicateAddress(addresses, nif, street, postal_code, city);
        if (errorDuplicateAddress !== "") {
            return res.status(422).json({error: errorDuplicateAddress});
        }

        let modified = false;
        if ((!addressOrder.nif && nif) || addressOrder.nif !== nif) {
            user.addresses[posAddress].nif = nif;
            modified = true;
        } else if(addressOrder.nif && !nif) {
            delete user.addresses[posAddress].nif;
            modified = true;
        }

        if (addressOrder.address.street !== street) {
            user.addresses[posAddress].address.street = street;
            modified = true;
        }

        if (addressOrder.address.postal_code !== postal_code) {
            user.addresses[posAddress].address.postal_code = postal_code;
            modified = true;
        }

        if (addressOrder.address.city !== city) {
            user.addresses[posAddress].address.city = city;
            modified = true;
        }

        if (modified) {
            console.log("Algum campo do utilizador foi alterado");
            await user.save();
        }

        res.status(200).json(user.addresses[posAddress]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({error: error });
    }
}

/* Controller que elimina a morada */
addressController.deleteAddress = function(req, res) {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
    )
    .then(result => {
        if (result.matchedCount === 0) {
            return res.status(404).json({error: 'Utilizador não foi encontrado' });
        }
         
        if (result.modifiedCount === 0) {
            return res.status(400).json({error: 'Endereço não encontrado ou já removido' });
        }

        return res.sendStatus(204);
    })
}

module.exports = addressController;