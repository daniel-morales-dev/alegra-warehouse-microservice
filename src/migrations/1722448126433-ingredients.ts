import { MigrationInterface, QueryRunner } from "typeorm";

export class Ingredients1722448126433 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
