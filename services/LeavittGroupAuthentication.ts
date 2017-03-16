export default class LeavittGroupAuthentication {
    publicKey: string;
    jwtSimple;

    constructor(jwtSimple){
        if (jwtSimple == null){
            throw new Error("LeavittGroupAuthentication needs to supplied a jwt.");
        }

        this.jwtSimple =jwtSimple;
        this.publicKey = `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzlDs/IW1tIkSJ9G+clkk
        m0DSb4MmwfVm9WB0CAZ9A1Iatzcm5lxayZmpYsU9XUbcOS2KzE3Dr1VWgmyEnC/K
        ZpDXyRUmoTocQHXGqKahKdLvutC/umXooMW9KReYQ+6ModXYPkBRbMAhqlAOSeDF
        1IYFmiGxPYe5lziWJ+ANGk8X787eRD99D+hpVb3v4lLYtb+rULHrIoxMjgk5mLqm
        nbzu2jHEXzx7BRq5kW9VYut6DoBqwWl3PpLNdDoOTgGiBIjanYj9B7apyCy3mK3d
        c9ND/StdOfhUM+CATRDCuUrvQ937MxRVn7VdhloHpWTqLcyhkLWyNBXlZUVbn7Nr
        FwIDAQAB
        -----END PUBLIC KEY-----`;

    }

    decode(token){
        return this.jwtSimple.decode(token, this.publicKey);
    }
}