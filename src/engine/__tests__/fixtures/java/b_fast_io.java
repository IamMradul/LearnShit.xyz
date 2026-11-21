import java.io.*;
import java.util.StringTokenizer;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null && !line.trim().isEmpty()) {
            int n = Integer.parseInt(line.trim());
            StringTokenizer st = new StringTokenizer(br.readLine());
            long total = 0;
            while (st.hasMoreTokens()) {
                total += Integer.parseInt(st.nextToken());
            }
            PrintWriter out = new PrintWriter(System.out);
            out.println(total);
            out.flush();
        }
    }
}