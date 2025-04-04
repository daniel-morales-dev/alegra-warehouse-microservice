import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ShoppingHistory } from "./shoppingHistory.model";

@Entity("ingredients")
export class Ingredients {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column({ type: "text", name: "name" })
  name: string;

  @Column({ type: "integer", name: "quantity" })
  quantity: number;

  @OneToMany(
    () => ShoppingHistory,
    (shoppingHistory) => shoppingHistory.ingredients,
  )
  shoppingHistory: ShoppingHistory[];
}
