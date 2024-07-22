import ListProduct from "@/components/list-product";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
  });
  return products;
}


export default async function Products() {
  // const product = await prisma.product.create({
  //   data: {
  //     title: "고구마",
  //     price: 999,
  //     photo: "/goguma.jpg",
  //     description: "맛있는 고구마",
  //     userId: 1,
  //   },
  // });
  const products = await getProducts();
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
    </div>
  );
}