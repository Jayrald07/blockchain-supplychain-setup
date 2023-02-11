export const isPasswordValid = (password: string) => {
    const conditions: any = {
        characters: "Password should contain 8 or more than characters",
        capital: "Password should start with a capital letter",
        number: "Password should contain number",
        special: "Password should contain atleast 1 special character"
    }

    if (/.{8}/.test(password)) delete conditions.characters;
    if (/\d/.test(password)) delete conditions.number;
    if (/^[A-Z]/.test(password)) delete conditions.capital;
    if (/[!@#$%^&*(),.?":{}|<>_]/.test(password)) delete conditions.special;

    return conditions;
}