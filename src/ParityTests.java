/*
 * DecimalFormat 0.1.0-beta.1
 * Copyright (c) 2018
 * https://github.com/node-htl/DecimalFormat/
 *
 * Licensed under the BSD 3-Clause license.
 */
import java.util.*;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.io.IOException;
import java.io.FileWriter;
import java.io.BufferedWriter;
import java.nio.file.Paths;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.ArrayList;

public class ParityTests {
	static Pattern lazyEscapePattern = Pattern.compile("[^\\w\\d ,#\\-_;:]", Pattern.CASE_INSENSITIVE);
	static String TEST_PATH = "tests";
	static String JSON_UNICODE_PATTERN = "\\u%04x";

	 static public String test(String pattern, double value) throws IOException {
		List<Double> numberList = new ArrayList<Double>(6);
		List<String> stringList = new ArrayList<String>();
		Boolean success = false;
		Boolean isDecimalSeparatorAlwaysShown = false;
		String errorMessage = "";

		numberList.add(value);
		stringList.add(pattern);

		try {
			DecimalFormat df = new DecimalFormat(pattern);
			String output = df.format(value);

			numberList.add((double) df.getGroupingSize());
			numberList.add((double) df.getMaximumFractionDigits());
			numberList.add((double) df.getMaximumIntegerDigits());
			numberList.add((double) df.getMinimumFractionDigits());
			numberList.add((double) df.getMinimumIntegerDigits());
			numberList.add((double) df.getMultiplier());

			stringList.add(df.getPositivePrefix());
			stringList.add(df.getPositiveSuffix());
			stringList.add(df.getNegativePrefix());
			stringList.add(df.getNegativeSuffix());
			stringList.add(output);

			isDecimalSeparatorAlwaysShown = df.isDecimalSeparatorAlwaysShown();
			success = true;
		} catch (IllegalArgumentException e) {
			errorMessage = e.toString();
		}

		if (success) {
			String[] props = new String[14];

			props[0] = lazyJSONPair("pattern", stringList.get(0));
			props[1] = lazyJSONPair("success", success);
			props[2] = lazyJSONPair("positivePrefix", stringList.get(1));
			props[3] = lazyJSONPair("positiveSuffix", stringList.get(2));
			props[4] = lazyJSONPair("negativePrefix", stringList.get(3));
			props[5] = lazyJSONPair("negativeSuffix", stringList.get(4));
			props[6] = lazyJSONPair("output", stringList.get(5));
			props[7] = lazyJSONPair("input", numberList.get(0));
			props[8] = lazyJSONPair("groupingSize", numberList.get(1));
			props[9] = lazyJSONPair("maximumFractionDigits", numberList.get(2));
			props[10] = lazyJSONPair("maximumIntegerDigits", numberList.get(3));
			props[11] = lazyJSONPair("minimumFractionDigits", numberList.get(4));
			props[12] = lazyJSONPair("minimumIntegerDigits", numberList.get(5));
			props[13] = lazyJSONPair("multiplier", numberList.get(5));

			return "{" + String.join(", ", props) + "}";
		} else {
			String[] props = new String[3];

			props[0] = lazyJSONPair("pattern", stringList.get(0));
			props[1] = lazyJSONPair("success", success);
			props[2] = lazyJSONPair("error", errorMessage);

			return "{" + String.join(", ", props) + "}";
		}
	}

	static public void writeFormatSymbols() throws IOException {
		DecimalFormatSymbols dfs = new DecimalFormatSymbols(Locale.US);
		String[] props = new String[8];

		props[0] = lazyJSONPair("currencySymbol", dfs.getCurrencySymbol());
		props[1] = lazyJSONPair("decimalSeparator", dfs.getDecimalSeparator());
		props[2] = lazyJSONPair("digit", dfs.getDigit());
		props[3] = lazyJSONPair("exponentSeparator", dfs.getExponentSeparator());
		props[4] = lazyJSONPair("groupingSeparator", dfs.getGroupingSeparator());
		props[5] = lazyJSONPair("minusSign", dfs.getMinusSign());
		props[6] = lazyJSONPair("percent", dfs.getPercent());
		props[7] = lazyJSONPair("perMill", dfs.getPerMill());

		String outputPath = Paths.get(TEST_PATH, "locale.json").toString();
		System.out.println("Writing locale JSON to: " + outputPath);

		FileWriter fileWriter = new FileWriter(outputPath);
		BufferedWriter writer = new BufferedWriter(fileWriter);
		writer.write("{" + String.join(", ", props) + "}");
		writer.close();
	}

	static public String lazyJSONPair(Object key, Object value) {
		return lazyJSONString(key.toString()) + ": " + lazyJSONString(value.toString());
	}

	static public String lazyJSONPair(Object key, Double value) {
		return lazyJSONString(key.toString()) + ": " + value.toString();
	}

	static public String lazyJSONPair(Object key, Boolean value) {
		return lazyJSONString(key.toString()) + ": " + value.toString();
	}

	static public String lazyJSONString(String string) {
		return "\"" + lazyEncodeString(string) + "\"";
	}

	static public String lazyEncodeString(String string) {
		Matcher lazyMatcher = lazyEscapePattern.matcher(string);
		StringBuffer buffer = new StringBuffer();
		while (lazyMatcher.find()) {
			String replacement = String.format(JSON_UNICODE_PATTERN, (int) lazyMatcher.group(0).charAt(0));
			lazyMatcher.appendReplacement(buffer, Matcher.quoteReplacement(replacement));
		}
		lazyMatcher.appendTail(buffer);
		return buffer.toString();
	}

	public static void writeResults() throws IOException {
		String outputPath = Paths.get(TEST_PATH, "tests.json").toString();
		System.out.println("Writing parity tests to: " + outputPath);
		FileWriter fileWriter = new FileWriter(outputPath);
		BufferedWriter writer = new BufferedWriter(fileWriter);
		List<String> results = new ArrayList<String>();

		Double[] values = { 0.0, 0.123, 0.9999, 1.0, 1.234, 1000.00, 1e8, -0.0, -0.123, -0.9999, -1.0, -1.234, -1000.00, -1e8};

		for (int i = 0; i < values.length; i += 1) {
			double j = values[i];
			results.add(test("#", j));
			results.add(test("#.", j));
			results.add(test("0.", j));
			results.add(test("#.#", j));
			results.add(test("0.0", j));
			results.add(test("#.0", j));
			results.add(test("#.###", j));
			results.add(test("#.000", j));
			results.add(test("#%", j));
			results.add(test("#.###%", j));
			results.add(test("0%", j));
			results.add(test("0.000%", j));
			results.add(test("A#B", j));
			results.add(test("'#'#", j));
			results.add(test(".", j));
			results.add(test(",#", j));
			results.add(test(",0", j));
			results.add(test("#,#", j));
			results.add(test("#,##", j));
			results.add(test("#,###", j));
			results.add(test("#,#,#,###", j));
			results.add(test("-#-;-#-", j));
			results.add(test("A#;A#", j));
			results.add(test("A#B;C#D", j));
			results.add(test("A#B;C-#D", j));
			results.add(test("  #  ;  -#  ", j));
		}

		String[] resultsArray = new String[results.size()];
		writer.write("[" + String.join(",\n", results.toArray(resultsArray)) + "]");
		writer.close();
	}

	static public void main(String[] args) {
		try {
			writeFormatSymbols();
			writeResults();
			System.out.println("Done.");
		} catch (Exception e) {
			System.out.println(e);
		}
	 }
}
