import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int r = sc.nextInt();
            int c = sc.nextInt();
            int sum = 0;
            int[][] mat = new int[r][c];
            for (int i = 0; i < r; i++) {
                for (int j = 0; j < c; j++) {
                    mat[i][j] = sc.nextInt();
                    sum += mat[i][j];
                }
            }
            System.out.println(sum);
        }
    }
}