import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ingredients")
export class Ingredients {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column({ type: "text", name: "name" })
  name: string;

  @Column({ type: "integer", name: "quantity" })
  quantity: number;
}
