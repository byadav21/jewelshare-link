import { useState } from "react";
import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { AnimatedCounter } from "./AnimatedCounter";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { TrendingUp, Clock, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const InteractiveROICalculator = () => {
  const [products, setProducts] = useState(500);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [customersPerMonth, setCustomersPerMonth] = useState(100);

  const navigate = useNavigate();

  // Calculations
  const timeSaved = Math.round((hoursPerWeek * 0.6) * 10) / 10; // 60% time reduction
  const reachIncrease = Math.round((products / 100) * (customersPerMonth / 10));
  const efficiencyBoost = Math.min(Math.round((products / 50) + (customersPerMonth / 20)), 95);

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-background via-background to-muted/20 p-8 shadow-xl">
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-4 inline-block"
        >
          <div className="rounded-full bg-gradient-to-br from-jewellery-from via-jewellery-via to-jewellery-to p-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        <h3 className="mb-2 text-3xl font-bold">Calculate Your Growth Potential</h3>
        <p className="text-muted-foreground">
          See how much time and effort you could save with our platform
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Controls */}
        <div className="space-y-6">
          <div>
            <label className="mb-3 flex items-center justify-between text-sm font-medium">
              <span>Products in Catalog</span>
              <span className="text-lg font-bold text-primary">
                <AnimatedCounter end={products} duration={300} />
              </span>
            </label>
            <Slider
              value={[products]}
              onValueChange={(value) => setProducts(value[0])}
              min={10}
              max={10000}
              step={10}
              className="cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>10,000</span>
            </div>
          </div>

          <div>
            <label className="mb-3 flex items-center justify-between text-sm font-medium">
              <span>Hours Spent Weekly on Management</span>
              <span className="text-lg font-bold text-primary">
                <AnimatedCounter end={hoursPerWeek} duration={300} />h
              </span>
            </label>
            <Slider
              value={[hoursPerWeek]}
              onValueChange={(value) => setHoursPerWeek(value[0])}
              min={1}
              max={40}
              step={1}
              className="cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1h</span>
              <span>40h</span>
            </div>
          </div>

          <div>
            <label className="mb-3 flex items-center justify-between text-sm font-medium">
              <span>Customers Reached Monthly</span>
              <span className="text-lg font-bold text-primary">
                <AnimatedCounter end={customersPerMonth} duration={300} />
              </span>
            </label>
            <Slider
              value={[customersPerMonth]}
              onValueChange={(value) => setCustomersPerMonth(value[0])}
              min={10}
              max={5000}
              step={10}
              className="cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>5,000</span>
            </div>
          </div>
        </div>

        {/* Output Results */}
        <div className="space-y-4">
          <TiltCard className="group" maxTilt={5} scale={1.01}>
            <div className="rounded-xl border bg-gradient-to-br from-jewellery-from/10 to-jewellery-to/10 p-6 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-jewellery-from" />
                <span className="text-sm font-medium text-muted-foreground">Time Saved</span>
              </div>
              <div className="text-4xl font-bold text-jewellery-from">
                <AnimatedCounter end={timeSaved} duration={500} suffix="h" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">per week</p>
              <motion.div
                className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-jewellery-from to-jewellery-to"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(timeSaved / hoursPerWeek) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </motion.div>
            </div>
          </TiltCard>

          <TiltCard className="group" maxTilt={5} scale={1.01}>
            <div className="rounded-xl border bg-gradient-to-br from-gemstone-from/10 to-gemstone-to/10 p-6 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-gemstone-from" />
                <span className="text-sm font-medium text-muted-foreground">Additional Reach</span>
              </div>
              <div className="text-4xl font-bold text-gemstone-from">
                +<AnimatedCounter end={reachIncrease} duration={500} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">customers per month</p>
              <motion.div
                className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-gemstone-from to-gemstone-to"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </motion.div>
            </div>
          </TiltCard>

          <TiltCard className="group" maxTilt={5} scale={1.01}>
            <div className="rounded-xl border bg-gradient-to-br from-diamond-from/10 to-diamond-to/10 p-6 transition-all">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-diamond-from" />
                <span className="text-sm font-medium text-muted-foreground">Efficiency Boost</span>
              </div>
              <div className="text-4xl font-bold text-diamond-from">
                <AnimatedCounter end={efficiencyBoost} duration={500} suffix="%" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">productivity increase</p>
              <motion.div
                className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-diamond-from to-diamond-to"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${efficiencyBoost}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </motion.div>
            </div>
          </TiltCard>
        </div>
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="group relative overflow-hidden bg-gradient-to-r from-jewellery-from via-jewellery-via to-jewellery-to text-lg"
        >
          <span className="relative z-10">Start Growing Today</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-jewellery-to via-jewellery-via to-jewellery-from"
            initial={{ x: "100%" }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          Join thousands of jewelry businesses already growing with our platform
        </p>
      </motion.div>
    </div>
  );
};
