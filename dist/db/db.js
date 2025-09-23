export class InMemoryDatabase {
    constructor() {
        this.data = [];
        // Evita instanciação direta
    }
    static getInstance() {
        if (!InMemoryDatabase.instance) {
            InMemoryDatabase.instance = new InMemoryDatabase();
            console.log('Banco de dados em memória (array) criado.');
        }
        return InMemoryDatabase.instance;
    }
    create(user) {
        this.data.push(user);
    }
    read() {
        return this.data;
    }
    filterUser(email) {
        const user = this.data.find((u) => u.email === email);
        return user ? user : null;
    }
}
InMemoryDatabase.instance = null;
export const db = InMemoryDatabase.getInstance();
