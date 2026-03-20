import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";

export function StatisticsChart({ chart, title, description, footer }) {
  return (
    <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-all">

      {/* HEADER CHART */}

      <CardHeader
        floated={false}
        shadow={false}
        className="mx-4 mt-4 rounded-xl p-4 bg-blue-50"
      >
        <Chart {...chart} />
      </CardHeader>

      {/* BODY */}

      <CardBody className="px-6 pt-4 pb-2">

        <Typography
          variant="h6"
          className="text-gray-900 font-bold"
        >
          {title}
        </Typography>

        <Typography
          variant="small"
          className="text-gray-600 font-medium mt-1"
        >
          {description}
        </Typography>

      </CardBody>

      {/* FOOTER */}

      {footer && (
        <CardFooter className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

StatisticsChart.defaultProps = {
  footer: null,
};

StatisticsChart.propTypes = {
  chart: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsChart.displayName = "/src/widgets/charts/statistics-chart.jsx";

export default StatisticsChart;