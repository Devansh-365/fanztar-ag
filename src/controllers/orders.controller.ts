import { randomUUID } from "crypto";
import express from "express";

interface Component {
  code: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  total: number;
  parts: Component[];
}

const componentsInit: Component[] = [
  { code: "A", name: "LED Screen", price: 10.28 },
  { code: "B", name: "OLED Screen", price: 24.07 },
  { code: "C", name: "AMOLED Screen", price: 33.3 },
  { code: "D", name: "Wide-Angle Camera", price: 25.94 },
  { code: "E", name: "Ultra-Wide-Angle Camera", price: 32.39 },
  { code: "F", name: "USB-C Port", price: 18.77 },
  { code: "G", name: "Micro-USB Port", price: 15.13 },
  { code: "H", name: "Lightning Port", price: 20.0 },
  { code: "I", name: "Android OS", price: 42.31 },
  { code: "J", name: "iOS OS", price: 45.0 },
  { code: "K", name: "Metallic Body", price: 45.0 },
  { code: "L", name: "Plastic Body", price: 30.0 },
];

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

    if (!Array.isArray(componentCodes) || componentCodes.length !== 5) {
      return res.status(400).send({ error: "Invalid input" });
    }

    const components: any = componentCodes.map((code) => {
      const component = componentsInit.find(
        (component: Component) => component.code === code
      );
      if (!component) {
        return res.status(400).send({ error: `Component not found: ${code}` });
      }
      return component;
    });

    const componentsWithCategories = components.map((component: Component) => ({
      ...component,
      category: getCategoryFromName(component.name),
    }));

    const categories = componentsWithCategories.reduce(
      (acc: any, component: any) => {
        acc[component.category].push(component);
        return acc;
      },
      { screen: [], camera: [], port: [], os: [], body: [] }
    );

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
      parts: components.map((component: Component) => component.name),
    };

    res.status(201).send(order);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
