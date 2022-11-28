import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.{DataFrame, SaveMode, SparkSession}
import org.apache.spark.serializer.KryoSerializer
import org.apache.sedona.sql.utils.SedonaSQLRegistrator
import org.apache.sedona.viz.core.Serde.SedonaVizKryoRegistrator
import org.apache.sedona.viz.sql.utils.SedonaVizRegistrator


object Entrance extends App {
  Logger.getLogger("org.spark_project").setLevel(Level.WARN)
  Logger.getLogger("org.apache").setLevel(Level.WARN)
  Logger.getLogger("akka").setLevel(Level.WARN)
  Logger.getLogger("com").setLevel(Level.WARN)

  override def main(args: Array[String]) {

    val spark: SparkSession = SparkSession.builder()
    .config("spark.serializer",classOf[KryoSerializer].getName)
    .config("spark.kryo.registrator", classOf[SedonaVizKryoRegistrator].getName)
    .master("local[*]")
    .appName("SDSE-Phase-1-Apache-Sedona")
    .getOrCreate()

    SedonaSQLRegistrator.registerAll(spark)
    SedonaVizRegistrator.registerAll(spark)

    queryLoader(spark, args: Array[String])
  }

  private def queryLoader(spark: SparkSession, args: Array[String]) {

    val queryName = args(1)
    if (queryName.equalsIgnoreCase("get-trajectory-data")) {
      if (args.length != 3) throw new ArrayIndexOutOfBoundsException("Query " + queryName + " needs 3 parameter but you entered " + args.length)
      ManageTrajectory.loadTrajectoryData(spark, args(2), args(0))
    }
    else if (queryName.equalsIgnoreCase("get-spatial-range")) {
      if (args.length != 7) throw new ArrayIndexOutOfBoundsException("Query " + queryName + " needs 7 parameter but you entered " + args.length)
      ManageTrajectory.getSpatialRange(spark, args(2).toDouble, args(3).toDouble, args(4).toDouble, args(5).toDouble, args(0), args(6))
    }
    else if (queryName.equalsIgnoreCase("get-spatiotemporal-range")) {
      if (args.length != 9) throw new ArrayIndexOutOfBoundsException("Query " + queryName + " needs 9 parameter but you entered " + args.length)
      ManageTrajectory.getSpatioTemporalRange(spark, args(2).toLong, args(3).toLong, args(4).toDouble, args(5).toDouble, args(6).toDouble, args(7).toDouble, args(0), args(8))
    }
    else if (queryName.equalsIgnoreCase("get-knn")) {
      if (args.length != 5) throw new ArrayIndexOutOfBoundsException("Query " + queryName + " needs 5 parameter but you entered " + args.length)
      ManageTrajectory.getKNNTrajectory(spark, args(2).toLong, args(3).toInt, args(0), args(4))
    }
    else {
      throw new NoSuchElementException("The given query name " + queryName + " is wrong. Please check your input.")
    }
  }
}
