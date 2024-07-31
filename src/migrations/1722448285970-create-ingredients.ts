import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIngredients1722448285970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO ingredients (name, quantity) VALUES
            ('tomato', 5),
            ('lemon', 5),
            ('potato', 5),
            ('rice', 5),
            ('ketchup', 5),
            ('lettuce', 5),
            ('onion', 5),
            ('cheese', 5),
            ('meat', 5),
            ('chicken', 5);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
