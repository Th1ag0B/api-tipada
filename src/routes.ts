import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FastifyTypedInstance } from "./types";
import z from "zod";

const prisma = new PrismaClient();

export async function routes(app: FastifyTypedInstance) {
  app.get(
    "/products",
    {
      schema: {
        tags: ["products"],
        description: "Retrieve all Products",
        response: {
          200: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                description: z.string(),
              })
            )
            .describe("List of Products"),
        },
      },
    },
    async () => {
      return await prisma.product.findMany();
    }
  );

  app.post(
    "/products/add",
    {
      schema: {
        tags: ["products"],
        description: "Create a new product",
        body: z.object({
          name: z.string(),
          description: z.string(),
        }),
        response: {
          201: z
            .object({
              message: z.string(),
            })
            .describe("Product created successfully"),
          400: z
            .object({
              error: z.string(),
            })
            .describe("Validation error"),
        },
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;

      try {
        await prisma.product.create({
          data: { name, description },
        });
        return reply.status(201).send({ message: "Product created successfully" });
      } catch (error: unknown) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return reply.status(400).send({ error: "Product already exists" });
          }
        }
        throw error;
      }
    }
  );

  app.put(
    "/products/update/:id",
    {
      schema: {
        tags: ["products"],
        description: "Update a product by ID",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
        }),
        response: {
          200: z
            .object({
              id: z.string(),
              name: z.string(),
              description: z.string(),
            })
            .describe("Updated product"),
          404: z
            .object({
              error: z.string(),
            })
            .describe("Product not found"),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { name, description } = request.body;

      try {
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { name, description },
        });
        return reply.status(200).send(updatedProduct);
      } catch (error: unknown) {
        return reply.status(404).send({ error: "Product not found" });
      }
    }
  );

  app.delete(
    "/products/delete/:id",
    {
      schema: {
        tags: ["products"],
        description: "Delete a product by ID",
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z
            .object({
              message: z.string(),
            })
            .describe("Product deleted successfully"),
          404: z
            .object({
              error: z.string(),
            })
            .describe("Product not found"),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.product.delete({ where: { id } });
        return reply.status(200).send({ message: "Product deleted successfully" });
      } catch (error: unknown) {
        return reply.status(404).send({ error: "Product not found" });
      }
    }
  );
}
