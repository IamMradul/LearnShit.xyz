import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            StringBuilder sb = new StringBuilder(s);
            System.out.println(sb.reverse().toString());
        }
    }
}