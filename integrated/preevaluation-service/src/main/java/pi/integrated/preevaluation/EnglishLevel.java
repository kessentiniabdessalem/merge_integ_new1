package pi.integrated.preevaluation;

public enum EnglishLevel {
    A1, A2, B1, B2, C1, C2;

    public EnglishLevel nextOrNull() {
        EnglishLevel[] v = values();
        int i = ordinal() + 1;
        return i < v.length ? v[i] : null;
    }
}
