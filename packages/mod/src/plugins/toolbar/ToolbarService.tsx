export class Toolbar {
    static items: { id: string; element: any }[] = [];

    static addItem(id: string, element: any): string {
        this.items.push({ id, element });
        return id;
    }

    static removeItem(id: string) {
        this.items = this.items.filter(item => item.id !== id);
    }

    static getItems() {
        return this.items.map(item => item.element);
    }
}