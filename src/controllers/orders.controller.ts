import { randomUUID } from "crypto";
import express from "express";
import fs from "fs";
import path from "path";

interface Component {
  code: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  total: number;
  parts: Component[];
}

let componentsInit: Component[] = [];
try {
  const filePath = path.join(__dirname, "../data/component.data.json");
  const rawData = fs.readFileSync(filePath, "utf8");
  componentsInit = JSON.parse(rawData);
  // console.log("USS", componentsInit);
} catch (err) {
  console.error(err);
}

function getCategoryFromName(name: string): string {
  if (name.includes("Screen")) {
    return "screen";
  } else if (name.includes("Camera")) {
    return "camera";
  } else if (name.includes("Port")) {
    return "port";
  } else if (name.includes("OS")) {
    return "os";
  } else if (name.includes("Body")) {
    return "body";
  } else {
    return "";
  }
}

export const createOrder = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { components: componentCodes } = req.body;
    // console.log("COMPONENTS INIT: ", componentsInit);

    if (!Array.isArray(componentCodes) || componentCodes.length !== 5) {
      return res.status(400).send({ error: "Invalid input" });
    }

    const errors: any = [];
    const components: any = componentCodes.map((code) => {
      const component = componentsInit.find(
        (component: Component) => component.code === code
      );
      if (!component) {
        errors.push(`Component not found: ${code}`);
        return null;
      }
      if (component.stock <= 0) {
        errors.push(`Component stock not availaible: ${code}`);
        return null;
      }
      component.stock -= 1;
      return component;
    });

    if (errors.length > 0) {
      return res.status(400).send({ errors });
    }

    const componentsWithCategories = components.map((component: Component) => ({
      ...component,
      category: getCategoryFromName(component.name),
    }));

    // console.log("Components With Categories: ", componentsWithCategories);

    const categories = componentsWithCategories.reduce(
      (acc: any, component: any) => {
        acc[component.category].push(component);
        return acc;
      },
      { screen: [], camera: [], port: [], os: [], body: [] }
    );

    // console.log("Categories: ", categories);

    for (const category in categories) {
      if (categories[category].length > 1) {
        return res
          .status(400)
          .send({ error: `Only one part of ${category} can be ordered.` });
      }
    }

    const total = components.reduce(
      (sum: number, component: Component) => sum + component.price,
      0
    );

    const order: Order = {
      id: randomUUID(),
      total,
      parts: components.map((component: Component) => ({
        ...component,
      })),
    };

    const filePath = path.join(__dirname, "../data/component.data.json");
    componentsInit = componentsInit.map((component: Component) => {
      const updatedComponent = components.find(
        (updatedComponent: Component) =>
          updatedComponent.code === component.code
      );
      return updatedComponent ? updatedComponent : component;
    });
    fs.writeFileSync(filePath, JSON.stringify(componentsInit));
    // const rawData = fs.readFileSync(filePath, "utf8");
    // console.log("TWO: ", JSON.parse(rawData));
    res.status(201).send(order);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
