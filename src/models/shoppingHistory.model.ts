import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Ingredients } from "./ingredients.model";

@Entity("shopping_history")
export class ShoppingHistory {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column({ type: "integer", name: "ingredient_id" })
  ingredientId: number;

  @Column({ type: "integer", name: "quantity" })
  quantity: number;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedAt = new Date();
  }

  @ManyToOne(() => Ingredients, (ingredients) => ingredients.shoppingHistory)
  @JoinColumn([{ name: "ingredient_id", referencedColumnName: "id" }])
  ingredients: Ingredients;
}
