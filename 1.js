// ═══════════════════════════════════════════════════════════════════
// CS-CONCEPTS-ENGINE.js
// Распознаёт 45+ концепций C# в коде, объясняет их, показывает ошибки
// Без внешних API — всё локально в браузере
// ═══════════════════════════════════════════════════════════════════

const CS_CONCEPTS = {
  // ── БАЗОВЫЕ ────────────────────────────────────────────────────
  variables: {
    name: 'Переменные',
    tags: ['базовое'],
    detect: (code) => /\b(int|long|double|float|string|bool|char|var|decimal|uint|byte|short)\s+\w+\s*=/.test(code),
    explain: `Переменная — именованная ячейка памяти для хранения данных.
В C# каждая переменная имеет тип, который определяет размер и допустимые операции.`,
    example: `int hp = 100;        // целое 32-бит
double pi = 3.14;    // дробное 64-бит
string name = "Hero"; // строка
bool alive = true;   // булево`,
    tip: 'var — автоматический вывод типа компилятором. Тип всё равно фиксируется при компиляции.',
  },

  conditions: {
    name: 'Условия (if/else/switch)',
    tags: ['базовое'],
    detect: (code) => /\bif\s*\(/.test(code) || /\bswitch\s*\(/.test(code),
    explain: `Условные операторы управляют потоком выполнения программы.
if/else проверяет одно условие, switch — выбирает из множества вариантов.`,
    example: `if (hp <= 0) {
    Console.WriteLine("Game Over");
} else if (hp < 30) {
    Console.WriteLine("Low HP!");
} else {
    Console.WriteLine("OK");
}

switch(state) {
    case "idle": DoIdle(); break;
    case "run":  DoRun();  break;
    default:     break;
}`,
    tip: 'C# 8+ поддерживает switch expressions: var result = x switch { 1 => "one", _ => "other" };',
  },

  loops: {
    name: 'Циклы (for/while/foreach)',
    tags: ['базовое'],
    detect: (code) => /\b(for|while|foreach|do)\s*\(/.test(code),
    explain: `Циклы повторяют блок кода заданное количество раз или пока условие истинно.`,
    example: `// for — счётчик
for (int i = 0; i < 10; i++) { }

// foreach — по коллекции
foreach (var item in list) { }

// while — пока условие
while (hp > 0) { hp -= 10; }

// do-while — хотя бы раз
do { Read(); } while (!done);`,
    tip: 'break прерывает цикл, continue — переходит к следующей итерации.',
  },

  methods: {
    name: 'Методы (функции)',
    tags: ['базовое'],
    detect: (code) => /static\s+\w[\w<>\[\]]*\s+\w+\s*\([^)]*\)\s*\{/.test(code),
    explain: `Метод — именованный блок кода, который можно вызывать многократно.
Принимает параметры, возвращает значение (или void если ничего не возвращает).`,
    example: `static int Add(int a, int b) {
    return a + b;
}

static void PrintLine(string msg) {
    Console.WriteLine(msg);
}

// вызов
int result = Add(3, 5); // result = 8`,
    tip: 'C# поддерживает перегрузку методов — одно имя, разные параметры.',
  },

  classes: {
    name: 'Классы',
    tags: ['ООП'],
    detect: (code) => /\bclass\s+\w+/.test(code),
    explain: `Класс — шаблон для создания объектов. Содержит поля (данные) и методы (поведение).
Основа объектно-ориентированного программирования в C#.`,
    example: `class Player {
    public string Name;
    public int HP;

    public void Attack(Enemy e) {
        e.HP -= 10;
    }
}`,
    tip: 'Классы — ссылочные типы (reference type). Хранятся в куче, передаются по ссылке.',
  },

  objects: {
    name: 'Объекты (экземпляры)',
    tags: ['ООП'],
    detect: (code) => /new\s+[A-Z]\w+\s*\(/.test(code),
    explain: `Объект — конкретный экземпляр класса, созданный с помощью оператора new.
Каждый объект имеет свою копию данных (полей).`,
    example: `Player hero = new Player();
hero.Name = "Arthur";
hero.HP = 100;

// C# 9+ — target-typed new
Player villain = new() { Name = "Boss", HP = 500 };`,
    tip: 'new вызывает конструктор и выделяет память в куче.',
  },

  arrays: {
    name: 'Массивы',
    tags: ['коллекции'],
    detect: (code) => /\w+\s*\[\s*\]|\bnew\s+(int|string|double|float|bool|char|long)\s*\[/.test(code),
    explain: `Массив — фиксированная последовательность элементов одного типа.
Индексация с нуля. Размер задаётся при создании и не меняется.`,
    example: `int[] nums = new int[5];       // 5 нулей
int[] primes = { 2, 3, 5, 7, 11 }; // инициализация

Console.WriteLine(primes[0]); // 2
Console.WriteLine(primes.Length); // 5

// двумерный
int[,] grid = new int[3, 3];`,
    tip: 'Для изменяемых коллекций используй List<T> вместо массива.',
  },

  listT: {
    name: 'List<T> — динамический список',
    tags: ['коллекции'],
    detect: (code) => /List\s*</.test(code),
    explain: `List<T> — динамический массив. Автоматически расширяется при добавлении элементов.
Самая часто используемая коллекция в C#.`,
    example: `var names = new List<string>();
names.Add("Alice");
names.Add("Bob");
names.Remove("Alice");

Console.WriteLine(names.Count); // 1
Console.WriteLine(names[0]);    // Bob

// инициализация с данными
var nums = new List<int> { 1, 2, 3, 4, 5 };`,
    tip: 'List<T> реализован как массив с автоудвоением ёмкости при переполнении.',
  },

  dictionary: {
    name: 'Dictionary<K,V> — словарь',
    tags: ['коллекции'],
    detect: (code) => /Dictionary\s*</.test(code),
    explain: `Dictionary — хеш-таблица. Хранит пары ключ→значение.
Поиск по ключу O(1) — очень быстро.`,
    example: `var scores = new Dictionary<string, int>();
scores["Alice"] = 100;
scores["Bob"]   = 85;

if (scores.ContainsKey("Alice")) {
    Console.WriteLine(scores["Alice"]); // 100
}

foreach (var pair in scores) {
    Console.WriteLine($"{pair.Key}: {pair.Value}");
}`,
    tip: 'TryGetValue безопаснее прямого обращения — не бросает исключение если ключ не найден.',
  },

  random: {
    name: 'Random — случайные числа',
    tags: ['базовое'],
    detect: (code) => /\bnew\s+Random\b|\.Next\s*\(|\.NextDouble/.test(code),
    explain: `Класс Random генерирует псевдослучайные числа.
Один экземпляр Random на программу — не создавай новый в каждом цикле.`,
    example: `Random rnd = new Random();

int dice    = rnd.Next(1, 7);     // 1..6
int percent = rnd.Next(0, 101);   // 0..100
double d    = rnd.NextDouble();   // 0.0..1.0

// C# 6+: статический метод (потокобезопасный)
int x = Random.Shared.Next(100);`,
    tip: 'Random.Shared (C# 6+) — статический, потокобезопасный, рекомендуется вместо new Random().',
  },

  strings: {
    name: 'String — строки',
    tags: ['базовое'],
    detect: (code) => /\$"[^"]*\{|string\s+\w+\s*=|\.ToUpper|\.ToLower|\.Contains|\.Replace|\.Split|\.Substring|\.Length/.test(code),
    explain: `string — неизменяемая (immutable) последовательность символов Unicode.
Строки в C# — объекты класса String.`,
    example: `string s = "Hello, World!";

// интерполяция (C# 6+)
string msg = $"HP: {hp} / {maxHP}";

// методы
s.ToUpper()         // "HELLO, WORLD!"
s.Contains("World") // true
s.Replace("o","0")  // "Hell0, W0rld!"
s.Split(',')        // ["Hello", " World!"]
s.Substring(0, 5)   // "Hello"
s.Trim()            // убрать пробелы

// StringBuilder для многократной конкатенации
var sb = new System.Text.StringBuilder();
sb.Append("a").Append("b");`,
    tip: 'string неизменяема — каждая "модификация" создаёт новый объект. Используй StringBuilder для частых изменений.',
  },

  enums: {
    name: 'Enum — перечисления',
    tags: ['ООП'],
    detect: (code) => /\benum\s+\w+/.test(code),
    explain: `Enum — набор именованных целочисленных констант.
Делает код читаемым: GameState.Playing вместо числа 2.`,
    example: `enum Direction { North, South, East, West }
enum GameState { Menu = 0, Playing = 1, Paused = 2, GameOver = 3 }

GameState state = GameState.Playing;

if (state == GameState.Playing) {
    Console.WriteLine("Playing!");
}

// получить имя
Console.WriteLine(state.ToString()); // "Playing"`,
    tip: 'По умолчанию значения начинаются с 0. Можно задать [Flags] для битовых масок.',
  },

  structs: {
    name: 'Struct — структуры',
    tags: ['ООП'],
    detect: (code) => /\bstruct\s+\w+/.test(code),
    explain: `Struct — значимый тип (value type), хранится в стеке.
Идеален для маленьких неизменяемых данных: координаты, цвет, точка.`,
    example: `struct Vector2 {
    public float X;
    public float Y;

    public Vector2(float x, float y) { X = x; Y = y; }
    public float Length() => MathF.Sqrt(X*X + Y*Y);
    public override string ToString() => $"({X}, {Y})";
}

Vector2 pos = new Vector2(3, 4);
Console.WriteLine(pos.Length()); // 5`,
    tip: 'Struct копируется при передаче в метод, класс — передаётся по ссылке. Struct < 16 байт — норм.',
  },

  interfaces: {
    name: 'Interface — интерфейсы',
    tags: ['ООП'],
    detect: (code) => /\binterface\s+I[A-Z]|\binterface\s+\w+/.test(code),
    explain: `Interface — контракт: список методов/свойств, которые обязан реализовать класс.
Позволяет работать с разными классами одинаково (полиморфизм).`,
    example: `interface IAttack {
    int Damage { get; }
    void Attack(IAttack target);
}

class Sword : IAttack {
    public int Damage => 20;
    public void Attack(IAttack target) {
        Console.WriteLine($"Sword deals {Damage}!");
    }
}

IAttack weapon = new Sword();
weapon.Attack(weapon);`,
    tip: 'Класс может реализовывать несколько интерфейсов. В C# 8+ интерфейс может иметь реализацию по умолчанию.',
  },

  inheritance: {
    name: 'Inheritance — наследование',
    tags: ['ООП'],
    detect: (code) => /class\s+\w+\s*:\s*\w+/.test(code),
    explain: `Наследование позволяет одному классу (потомку) перенять поля и методы другого (родителя).
Ключевое слово base — обращение к родителю.`,
    example: `class Enemy {
    public int HP = 100;
    public virtual void Attack() {
        Console.WriteLine("Enemy attacks!");
    }
}

class Boss : Enemy {
    public int Phase = 1;
    public override void Attack() {
        base.Attack();
        Console.WriteLine($"BOSS FURY x{Phase}!");
    }
}

Enemy e = new Boss();
e.Attack(); // полиморфизм!`,
    tip: 'virtual/override — для переопределения. sealed — запрет наследования. abstract — обязательное переопределение.',
  },

  asyncAwait: {
    name: 'Async/Await — асинхронность',
    tags: ['многопоточность'],
    detect: (code) => /\basync\b|\bawait\b/.test(code),
    explain: `async/await — синтаксический сахар для работы с Task (асинхронными операциями).
Позволяет не блокировать поток во время ожидания ввода-вывода.`,
    example: `// Метод помечается async, возвращает Task
static async Task<string> FetchData(string url) {
    using var client = new HttpClient();
    string result = await client.GetStringAsync(url);
    return result;
}

// Вызов
async Task Main() {
    string data = await FetchData("https://api.example.com");
    Console.WriteLine(data);
}`,
    tip: 'async метод без await — обычный синхронный. Избегай async void — только для обработчиков событий.',
  },

  events: {
    name: 'Events — события',
    tags: ['ООП', 'делегаты'],
    detect: (code) => /\bevent\b|\b\+=\s*\w+|\bOnClick|EventHandler/.test(code),
    explain: `Event — механизм уведомления подписчиков о чём-то произошедшем.
Построен на делегатах. Паттерн Publisher/Subscriber.`,
    example: `class Button {
    public event Action OnClick;

    public void Click() {
        Console.WriteLine("Button clicked");
        OnClick?.Invoke(); // безопасный вызов
    }
}

var btn = new Button();
btn.OnClick += () => Console.WriteLine("Handler 1!");
btn.OnClick += () => Console.WriteLine("Handler 2!");
btn.Click(); // оба обработчика сработают`,
    tip: '?.Invoke() безопаснее прямого вызова — не бросит NPE если подписчиков нет.',
  },

  linq: {
    name: 'LINQ — запросы к данным',
    tags: ['продвинутое'],
    detect: (code) => /\.Where\s*\(|\.Select\s*\(|\.OrderBy\s*\(|\.FirstOrDefault\s*\(|\.Any\s*\(|\.All\s*\(|\.Sum\s*\(|\.Count\s*\(|from\s+\w+\s+in\s+/.test(code),
    explain: `LINQ (Language Integrated Query) — запросы прямо в коде C#.
Работает с любыми коллекциями, базами данных, XML.`,
    example: `var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Method syntax (чаще используется)
var evens = numbers.Where(n => n % 2 == 0).ToList();
var squares = numbers.Select(n => n * n).ToList();
var sum = numbers.Sum();
var max = numbers.Max();
var first = numbers.FirstOrDefault(n => n > 5); // 6

// Query syntax (SQL-подобный)
var query = from n in numbers
            where n % 2 == 0
            orderby n descending
            select n;`,
    tip: 'LINQ ленивый (lazy) — запрос выполняется только при итерации. ToList() форсирует выполнение.',
  },

  fileIO: {
    name: 'File I/O — работа с файлами',
    tags: ['система'],
    detect: (code) => /File\.(Read|Write|Append|Exists|Delete|Copy|Move)|StreamReader|StreamWriter/.test(code),
    explain: `Пространство имён System.IO содержит классы для работы с файлами и директориями.`,
    example: `using System.IO;

// Чтение
string text = File.ReadAllText("data.txt");
string[] lines = File.ReadAllLines("data.txt");

// Запись
File.WriteAllText("out.txt", "Hello!");
File.AppendAllText("log.txt", "New line\n");

// Проверка
if (File.Exists("data.txt")) { }

// StreamReader для больших файлов
using var reader = new StreamReader("big.txt");
string line;
while ((line = reader.ReadLine()) != null) { }`,
    tip: 'using гарантирует закрытие файла даже при исключении. Всегда используй using с потоками.',
  },

  json: {
    name: 'JSON — сериализация',
    tags: ['данные'],
    detect: (code) => /JsonSerializer|JsonConvert|Newtonsoft|System\.Text\.Json|\[JsonProperty/.test(code),
    explain: `Сериализация — преобразование объекта в строку JSON и обратно.
В .NET 5+ есть встроенный System.Text.Json, ранее популярен Newtonsoft.Json.`,
    example: `using System.Text.Json;

class Hero {
    public string Name { get; set; }
    public int HP { get; set; }
}

var hero = new Hero { Name = "Arthur", HP = 100 };

// Объект → JSON
string json = JsonSerializer.Serialize(hero);
// {"Name":"Arthur","HP":100}

// JSON → объект
Hero loaded = JsonSerializer.Deserialize<Hero>(json);
Console.WriteLine(loaded.Name); // Arthur`,
    tip: 'JsonSerializerOptions позволяет настроить camelCase, отступы, игнорирование null и т.д.',
  },

  http: {
    name: 'HTTP — интернет запросы',
    tags: ['сеть'],
    detect: (code) => /HttpClient|GetAsync|PostAsync|GetStringAsync|HttpResponseMessage/.test(code),
    explain: `HttpClient — стандартный класс для HTTP-запросов в .NET.
Всегда создавай один экземпляр и переиспользуй его (или используй IHttpClientFactory).`,
    example: `using System.Net.Http;
using System.Text;

var client = new HttpClient();

// GET запрос
string body = await client.GetStringAsync("https://api.example.com/data");

// POST запрос с JSON
var content = new StringContent(
    """{"name":"test"}""",
    Encoding.UTF8,
    "application/json"
);
var response = await client.PostAsync("/api/create", content);
response.EnsureSuccessStatusCode();`,
    tip: 'HttpClient создаёт сокет — не создавай new HttpClient() в каждом запросе, используй static или DI.',
  },

  threads: {
    name: 'Threads — потоки',
    tags: ['многопоточность'],
    detect: (code) => /\bThread\b|\.Start\s*\(\s*\)|ThreadPool|Interlocked/.test(code),
    explain: `Thread — низкоуровневый поток выполнения. Для большинства задач лучше использовать Task.
Потоки разделяют память — нужна синхронизация (lock, Mutex, Semaphore).`,
    example: `using System.Threading;

var t = new Thread(() => {
    Console.WriteLine($"Thread: {Thread.CurrentThread.ManagedThreadId}");
});
t.Start();
t.Join(); // ждём завершения

// Разделяемые данные — нужен lock
int counter = 0;
object sync = new object();
lock (sync) {
    counter++;
}`,
    tip: 'Для I/O задач используй async/await вместо Thread. Thread — для CPU-интенсивных задач.',
  },

  tasks: {
    name: 'Tasks — фоновые задачи',
    tags: ['многопоточность'],
    detect: (code) => /Task\.(Run|WhenAll|WhenAny|Delay|FromResult)|new\s+Task\s*\(/.test(code),
    explain: `Task — высокоуровневая абстракция над потоком. Основа async/await.
Task.Run запускает работу в ThreadPool.`,
    example: `// Запуск в фоне
var task = Task.Run(() => {
    // тяжёлая CPU работа
    return ComputeResult();
});

// Параллельно несколько
var t1 = Task.Run(() => Step1());
var t2 = Task.Run(() => Step2());
await Task.WhenAll(t1, t2);

// Задержка без блокировки потока
await Task.Delay(1000); // 1 секунда

// Уже готовый результат
var done = Task.FromResult(42);`,
    tip: 'Parallel.ForEach — для параллельной обработки коллекций. Не блокируй .Result — только await.',
  },

  exceptions: {
    name: 'Exception — обработка ошибок',
    tags: ['базовое'],
    detect: (code) => /\btry\s*\{|\bcatch\s*\(|\bfinally\s*\{|\bthrow\b/.test(code),
    explain: `Исключения — механизм обработки ошибок в C#. При ошибке выбрасывается исключение,
которое поднимается по стеку вызовов до ближайшего catch.`,
    example: `try {
    int result = 10 / 0;
} catch (DivideByZeroException ex) {
    Console.WriteLine($"Деление на ноль: {ex.Message}");
} catch (Exception ex) {
    Console.WriteLine($"Любая ошибка: {ex.Message}");
} finally {
    // выполняется всегда
    Console.WriteLine("Cleanup");
}

// Своё исключение
throw new InvalidOperationException("Нельзя!");`,
    tip: 'Ловить Exception слишком широко — плохая практика. Ловить нужно конкретный тип.',
  },

  reflection: {
    name: 'Reflection — рефлексия',
    tags: ['продвинутое'],
    detect: (code) => /typeof\s*\(|GetType\s*\(|\.GetProperties\s*\(|\.GetMethods\s*\(|Assembly\./.test(code),
    explain: `Рефлексия позволяет изучать и вызывать код во время выполнения.
Используется в ORM, сериализаторах, DI-контейнерах.`,
    example: `using System.Reflection;

class Person {
    public string Name { get; set; }
    public int Age { get; set; }
}

Type t = typeof(Person);
Console.WriteLine(t.Name); // Person

// Перечислить свойства
foreach (var prop in t.GetProperties()) {
    Console.WriteLine($"{prop.Name}: {prop.PropertyType.Name}");
}

// Создать экземпляр динамически
object obj = Activator.CreateInstance(t);`,
    tip: 'Рефлексия медленнее прямого вызова. Для горячих путей используй скомпилированные Expression или Source Generators.',
  },

  generics: {
    name: 'Generics — обобщения',
    tags: ['продвинутое'],
    detect: (code) => /<[A-Z]\w*>|<T\b|<TKey|<TValue|where\s+T\s*:/.test(code),
    explain: `Generics позволяют писать код, работающий с любым типом, сохраняя типобезопасность.
List<T>, Dictionary<K,V> — примеры generic-коллекций.`,
    example: `// Generic-метод
static T Max<T>(T a, T b) where T : IComparable<T> {
    return a.CompareTo(b) > 0 ? a : b;
}

Console.WriteLine(Max(3, 7));       // 7
Console.WriteLine(Max("abc","xyz")); // xyz

// Generic-класс
class Stack<T> {
    private List<T> _items = new();
    public void Push(T item) => _items.Add(item);
    public T Pop() { var x = _items[^1]; _items.RemoveAt(_items.Count-1); return x; }
}`,
    tip: 'where T : IComparable<T> — ограничение (constraint). Без него T — просто "любой тип".',
  },

  delegates: {
    name: 'Delegates — делегаты',
    tags: ['делегаты'],
    detect: (code) => /\bdelegate\b|\bAction\b|\bFunc\b|\bPredicate\b/.test(code),
    explain: `Делегат — типобезопасный указатель на метод. Хранит ссылку на функцию.
Action — делегат без возврата, Func — с возвратом, Predicate — возвращает bool.`,
    example: `// Объявление своего делегата
delegate int MathOp(int a, int b);

MathOp add = (a, b) => a + b;
MathOp mul = (a, b) => a * b;

Console.WriteLine(add(3, 4)); // 7
Console.WriteLine(mul(3, 4)); // 12

// Встроенные делегаты
Action<string> print = Console.WriteLine;
Func<int, int, int> sum = (a, b) => a + b;
Predicate<int> isEven = n => n % 2 == 0;`,
    tip: 'Multicast delegate — один делегат держит несколько методов (список). Используется в events.',
  },

  lambda: {
    name: 'Lambda — анонимные функции',
    tags: ['делегаты'],
    detect: (code) => /=>\s*\{|=>\s*[^>]/.test(code),
    explain: `Lambda-выражение — короткая анонимная функция прямо в коде.
Синтаксис: параметры => тело`,
    example: `// Без параметров
Action greet = () => Console.WriteLine("Hi!");

// Один параметр
Action<string> print = msg => Console.WriteLine(msg);

// Несколько параметров
Func<int, int, int> add = (a, b) => a + b;

// Тело из нескольких строк
Func<int, int> factorial = n => {
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
};

// В LINQ
var evens = list.Where(x => x % 2 == 0);`,
    tip: 'Lambda захватывает переменные из внешней области (closure). Осторожно с захватом в циклах.',
  },

  properties: {
    name: 'Properties — свойства',
    tags: ['ООП'],
    detect: (code) => /\{?\s*get\s*[{;]|\{?\s*set\s*[{;]|get\s*=>\s*/.test(code),
    explain: `Свойства — способ контролировать доступ к полям класса. Выглядят как поля, работают как методы.`,
    example: `class Player {
    private int _hp;

    // Полное свойство с логикой
    public int HP {
        get => _hp;
        set => _hp = Math.Clamp(value, 0, MaxHP);
    }

    // Авто-свойство
    public string Name { get; set; }

    // Только для чтения
    public int MaxHP { get; } = 100;

    // Expression-bodied
    public bool IsAlive => HP > 0;
}`,
    tip: 'init accessor (C# 9+) позволяет задать значение только в конструкторе или инициализаторе.',
  },

  constructors: {
    name: 'Constructor — конструктор',
    tags: ['ООП'],
    detect: (code) => /public\s+[A-Z]\w*\s*\([^)]*\)\s*\{/.test(code),
    explain: `Конструктор — специальный метод, вызываемый при создании объекта (new).
Используется для инициализации полей.`,
    example: `class Enemy {
    public string Name;
    public int HP;
    public int Damage;

    // Основной конструктор
    public Enemy(string name, int hp, int damage) {
        Name   = name;
        HP     = hp;
        Damage = damage;
    }

    // Перегрузка
    public Enemy(string name) : this(name, 100, 10) { }
}

var boss = new Enemy("Dragon", 500, 50);
var mob  = new Enemy("Goblin");`,
    tip: 'this(...) вызывает другой конструктор этого же класса. base(...) — конструктор родителя.',
  },

  staticKeyword: {
    name: 'Static — статические члены',
    tags: ['ООП'],
    detect: (code) => /\bstatic\s+(?!void\s+Main|class\s+Program)/.test(code),
    explain: `static означает принадлежность классу, а не экземпляру.
Одна копия на всю программу. Вызывается через имя класса.`,
    example: `class GameConfig {
    public static int MaxPlayers = 4;
    public static string Version = "1.0";

    public static void PrintInfo() {
        Console.WriteLine($"v{Version}, max {MaxPlayers}p");
    }
}

// Вызов без создания объекта
GameConfig.PrintInfo();
Console.WriteLine(GameConfig.MaxPlayers);`,
    tip: 'static поля — глобальное состояние. Использовать осторожно в многопоточной среде.',
  },

  unsafeCode: {
    name: 'Unsafe — небезопасный код',
    tags: ['низкий уровень'],
    detect: (code) => /\bunsafe\b|\bfixed\s*\(|\bstackalloc\b/.test(code),
    explain: `unsafe позволяет использовать указатели напрямую — как в C/C++.
Требует явного разрешения в настройках проекта (<AllowUnsafeBlocks>true</AllowUnsafeBlocks>).`,
    example: `unsafe {
    int value = 42;
    int* ptr = &value;   // адрес переменной
    *ptr = 100;          // изменение через указатель
    Console.WriteLine(value); // 100
}

// Быстрая работа с массивами
unsafe {
    int[] arr = { 1, 2, 3 };
    fixed (int* p = arr) {
        p[0] = 99; // прямая запись в память
    }
}`,
    tip: 'unsafe нужен редко — для P/Invoke, высокопроизводительного кода. В 99% случаев безопасный код лучше.',
  },

  pointers: {
    name: 'Pointers — указатели',
    tags: ['низкий уровень'],
    detect: (code) => /\bint\*|\bchar\*|\bvoid\*|\bbyte\*|&\w+/.test(code),
    explain: `Указатели хранят адрес памяти, а не значение. Только в блоках unsafe.
В C# указатели работают только с примитивными типами и struct без ссылок.`,
    example: `unsafe {
    int a = 10, b = 20;
    int* pa = &a;
    int* pb = &b;

    // Меняем через указатели (swap)
    int temp = *pa;
    *pa = *pb;
    *pb = temp;

    Console.WriteLine($"a={a}, b={b}"); // a=20, b=10

    // Арифметика указателей
    int[] arr = {1,2,3,4,5};
    fixed(int* p = arr) {
        Console.WriteLine(*(p + 2)); // arr[2] = 3
    }
}`,
    tip: 'Span<T> и Memory<T> — современная альтернатива указателям для высокопроизводительного кода без unsafe.',
  },

  dllImport: {
    name: 'DllImport — вызов WinAPI / нативных функций',
    tags: ['система'],
    detect: (code) => /\[DllImport|P\/Invoke|extern\s+static/.test(code),
    explain: `P/Invoke (Platform Invoke) позволяет вызывать функции из нативных DLL (Win32 API, libc и т.д.).`,
    example: `using System.Runtime.InteropServices;

class WinApi {
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int MessageBox(IntPtr hWnd, string text, string caption, int type);

    [DllImport("kernel32.dll")]
    static extern uint GetCurrentThreadId();
}

// Системный звук
[DllImport("kernel32.dll")]
static extern void Beep(uint freq, uint duration);

Beep(440, 500); // нота Ля, 0.5 сек`,
    tip: 'CharSet.Unicode важен для строк в Windows. DllImport требует знания ABI нативного кода.',
  },

  sockets: {
    name: 'Socket — низкоуровневые сокеты',
    tags: ['сеть'],
    detect: (code) => /\bSocket\b|System\.Net\.Sockets|\.Accept\s*\(|\.Connect\s*\(/.test(code),
    explain: `Socket — низкоуровневое сетевое соединение. Основа TCP/UDP в .NET.
Для большинства задач лучше использовать TcpClient/TcpListener или HttpClient.`,
    example: `using System.Net;
using System.Net.Sockets;

// Сервер
var server = new Socket(SocketType.Stream, ProtocolType.Tcp);
server.Bind(new IPEndPoint(IPAddress.Any, 8080));
server.Listen(10);
var client = server.Accept(); // блокирует до подключения

// Отправить данные
byte[] msg = Encoding.UTF8.GetBytes("Hello!");
client.Send(msg);

// Клиент
var sock = new Socket(SocketType.Stream, ProtocolType.Tcp);
sock.Connect("127.0.0.1", 8080);`,
    tip: 'Для игр — UDP (низкая задержка). Для надёжной передачи — TCP. Socket — базовый кирпич.',
  },

  tcpUdp: {
    name: 'TCP/UDP — TcpClient / UdpClient',
    tags: ['сеть'],
    detect: (code) => /TcpClient|TcpListener|UdpClient|NetworkStream/.test(code),
    explain: `TcpClient/TcpListener — удобная обёртка над Socket для TCP.
UdpClient — для UDP (без установки соединения, быстрее, ненадёжно).`,
    example: `using System.Net;
using System.Net.Sockets;

// TCP сервер
var listener = new TcpListener(IPAddress.Any, 9000);
listener.Start();
var client = await listener.AcceptTcpClientAsync();
var stream = client.GetStream();

// Читать
byte[] buf = new byte[1024];
int n = await stream.ReadAsync(buf);
string msg = Encoding.UTF8.GetString(buf, 0, n);

// TCP клиент
var tcp = new TcpClient();
await tcp.ConnectAsync("127.0.0.1", 9000);`,
    tip: 'NetworkStream.ReadAsync возвращает 0 при закрытии соединения — всегда проверяй.',
  },

  websocket: {
    name: 'WebSocket — реальное время',
    tags: ['сеть'],
    detect: (code) => /WebSocket|ClientWebSocket|ServerWebSocket/.test(code),
    explain: `WebSocket — двунаправленный постоянный канал между сервером и клиентом.
Идеален для чата, игр реального времени, live-обновлений.`,
    example: `using System.Net.WebSockets;

// Клиент
var ws = new ClientWebSocket();
await ws.ConnectAsync(new Uri("wss://echo.websocket.org"), CancellationToken.None);

// Отправить
var msg = Encoding.UTF8.GetBytes("Hello WS!");
await ws.SendAsync(msg, WebSocketMessageType.Text, true, CancellationToken.None);

// Получить
var buffer = new byte[1024];
var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
string received = Encoding.UTF8.GetString(buffer, 0, result.Count);`,
    tip: 'ASP.NET Core SignalR — высокоуровневая надстройка над WebSocket с автопереподключением.',
  },

  gui: {
    name: 'GUI — Windows Forms',
    tags: ['UI'],
    detect: (code) => /Form|Button|Label|TextBox|Panel|Application\.Run|MessageBox\.Show/.test(code),
    explain: `Windows Forms — старейший UI-фреймворк .NET для Windows.
Простой, быстрый для создания базовых приложений. Designer в Visual Studio.`,
    example: `using System.Windows.Forms;

class MainForm : Form {
    Button btnOk = new Button { Text = "OK", Left = 10, Top = 10 };
    Label label  = new Label  { Text = "Hello!", Left = 10, Top = 50 };

    public MainForm() {
        btnOk.Click += (s, e) => MessageBox.Show("Clicked!");
        Controls.Add(btnOk);
        Controls.Add(label);
    }
}

Application.Run(new MainForm());`,
    tip: 'WinForms работает только на Windows. Для кроссплатформенного GUI — MAUI или Avalonia.',
  },

  wpf: {
    name: 'WPF — Windows Presentation Foundation',
    tags: ['UI'],
    detect: (code) => /\bWPF\b|xmlns.*wpf|<Window|<Grid|<StackPanel|DataContext|INotifyPropertyChanged/.test(code),
    explain: `WPF — мощный UI-фреймворк для Windows с XAML-разметкой и data binding.
Поддерживает векторную графику, анимации, темы.`,
    example: `// XAML (MainWindow.xaml)
<Window>
  <StackPanel>
    <TextBox Text="{Binding Name}" />
    <Button Content="Save" Command="{Binding SaveCmd}" />
  </StackPanel>
</Window>

// ViewModel (C#)
class ViewModel : INotifyPropertyChanged {
    private string _name;
    public string Name {
        get => _name;
        set { _name = value; OnPropertyChanged(); }
    }
    public event PropertyChangedEventHandler PropertyChanged;
    void OnPropertyChanged([CallerMemberName] string prop = "") =>
        PropertyChanged?.Invoke(this, new(prop));
}`,
    tip: 'MVVM (Model-View-ViewModel) — стандартный паттерн для WPF. CommunityToolkit.Mvvm упрощает его.',
  },

  maui: {
    name: 'MAUI — кроссплатформенный UI',
    tags: ['UI'],
    detect: (code) => /\.NET MAUI|ContentPage|Application\.Current|Microsoft\.Maui/.test(code),
    explain: `.NET MAUI (Multi-platform App UI) — преемник Xamarin.Forms.
Один код для Windows, macOS, iOS, Android.`,
    example: `// C# (code-behind или C# Markup)
var page = new ContentPage {
    Content = new VerticalStackLayout {
        Children = {
            new Label { Text = "Hello, MAUI!" },
            new Button {
                Text = "Click me",
                Command = new Command(() => DisplayAlert("Hi", "Button clicked!", "OK"))
            }
        }
    }
};`,
    tip: 'MAUI горячая перезагрузка (Hot Reload) позволяет менять XAML без перекомпиляции.',
  },

  gameLogic: {
    name: 'Game Logic — игровая логика',
    tags: ['игры'],
    detect: (code) => /\bUnity\b|MonoBehaviour|Update\s*\(\s*\)|FixedUpdate|Start\s*\(\s*\)|GameObject|Transform|Rigidbody/.test(code),
    explain: `Unity — самый популярный игровой движок, использующий C# как скриптовый язык.
MonoBehaviour — базовый класс для всех скриптов Unity.`,
    example: `using UnityEngine;

public class PlayerController : MonoBehaviour {
    public float speed = 5f;
    private Rigidbody rb;

    void Start() {
        rb = GetComponent<Rigidbody>();
    }

    void Update() {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        rb.velocity = new Vector3(h, 0, v) * speed;

        if (Input.GetKeyDown(KeyCode.Space)) {
            rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);
        }
    }
}`,
    tip: 'Update() вызывается каждый кадр. FixedUpdate() — с фиксированным шагом (60fps), используй для физики.',
  },

  webBackend: {
    name: 'Web Backend — ASP.NET Core',
    tags: ['веб'],
    detect: (code) => /WebApplication|app\.MapGet|app\.MapPost|app\.UseRouting|IActionResult|ControllerBase|ApiController/.test(code),
    explain: `ASP.NET Core — фреймворк для создания веб-API и сайтов на C#.
Minimal API — максимально краткий синтаксис для REST API.`,
    example: `using Microsoft.AspNetCore.Builder;

var app = WebApplication.Create();

// GET /hello
app.MapGet("/hello", () => "Hello, World!");

// GET /user/{id}
app.MapGet("/user/{id}", (int id) => new { Id = id, Name = "User" + id });

// POST /user
app.MapPost("/user", (User user) => {
    // сохранить пользователя
    return Results.Created($"/user/{user.Id}", user);
});

app.Run();
record User(int Id, string Name);`,
    tip: 'Minimal API (.NET 6+) быстрее традиционных Controllers. Для сложных проектов — MVC/Controller-based.',
  },

  blazor: {
    name: 'Blazor — C# во фронтенде',
    tags: ['веб', 'UI'],
    detect: (code) => /\bBlazor\b|@page|@code\s*\{|@inject|StateHasChanged/.test(code),
    explain: `Blazor — фреймворк для SPA (Single Page App) на C# вместо JavaScript.
Blazor Server — код на сервере. Blazor WASM — C# скомпилированный в WebAssembly, работает в браузере.`,
    example: `@page "/counter"

<h1>Counter: @count</h1>
<button @onclick="Increment">Click me</button>

@code {
    private int count = 0;

    void Increment() {
        count++;
        // StateHasChanged(); // обновить UI вручную
    }
}`,
    tip: 'Blazor WASM медленнее загружается из-за .NET runtime. Blazor Server быстрее, но требует постоянного соединения.',
  },

  orm: {
    name: 'ORM — Entity Framework',
    tags: ['базы данных'],
    detect: (code) => /DbContext|DbSet|\.Include\s*\(|\.SaveChanges|\.FirstOrDefaultAsync|EntityFramework/.test(code),
    explain: `ORM (Object-Relational Mapping) — работа с базой данных через объекты C#.
Entity Framework Core — стандартный ORM для .NET.`,
    example: `using Microsoft.EntityFrameworkCore;

class AppContext : DbContext {
    public DbSet<User> Users { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlite("Data Source=app.db");
}

class User {
    public int Id { get; set; }
    public string Name { get; set; }
}

// Использование
await using var db = new AppContext();
db.Users.Add(new User { Name = "Alice" });
await db.SaveChangesAsync();

var users = await db.Users.Where(u => u.Name.StartsWith("A")).ToListAsync();`,
    tip: 'Code First: сначала классы, потом миграции (dotnet ef migrations add). Database First — наоборот.',
  },

  aiml: {
    name: 'AI/ML — машинное обучение',
    tags: ['AI'],
    detect: (code) => /ML\.NET|MLContext|IDataView|PredictionEngine|TensorFlow|ONNX/.test(code),
    explain: `ML.NET — официальная библиотека машинного обучения от Microsoft для .NET.
Поддерживает классификацию, регрессию, кластеризацию, рекомендации.`,
    example: `using Microsoft.ML;
using Microsoft.ML.Data;

class HouseData {
    public float Size;
    [ColumnName("Label")] public float Price;
}

var context = new MLContext();
var data = context.Data.LoadFromEnumerable(new[] {
    new HouseData { Size = 1.1f, Price = 1.2f },
    new HouseData { Size = 1.9f, Price = 2.3f },
    new HouseData { Size = 2.8f, Price = 3.0f },
});

var pipeline = context.Transforms.Concatenate("Features", "Size")
    .Append(context.Regression.Trainers.Sdca());

var model = pipeline.Fit(data);`,
    tip: 'Для использования PyTorch/TensorFlow моделей в .NET есть TorchSharp и ONNX Runtime.',
  },

  compilerApi: {
    name: 'Compiler API — Roslyn',
    tags: ['продвинутое'],
    detect: (code) => /Microsoft\.CodeAnalysis|SyntaxTree|CSharpCompilation|SemanticModel|SyntaxNode/.test(code),
    explain: `Roslyn — компилятор C# с открытым API. Позволяет парсить, анализировать и генерировать C# код.
Основа для Roslyn analyzers, Source Generators, рефакторинга в IDE.`,
    example: `using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

string source = "int x = 42;";
var tree = CSharpSyntaxTree.ParseText(source);
var root = tree.GetRoot();

// Найти все переменные
var variables = root.DescendantNodes()
    .OfType<VariableDeclaratorSyntax>();

foreach (var v in variables) {
    Console.WriteLine($"Variable: {v.Identifier.Text}");
}`,
    tip: 'Source Generators (C# 9+) работают во время компиляции — генерируют код без рефлексии.',
  },
};

// ═══════════════════════════════════════════════════════════════════
// CONCEPT DETECTOR
// ═══════════════════════════════════════════════════════════════════

function detectConcepts(code) {
  const found = [];
  for (const [id, concept] of Object.entries(CS_CONCEPTS)) {
    if (concept.detect(code)) {
      found.push({ id, ...concept });
    }
  }
  return found;
}

// ═══════════════════════════════════════════════════════════════════
// ERROR ANALYZER — что сломалось и как починить
// ═══════════════════════════════════════════════════════════════════

const ERROR_PATTERNS = [
  {
    pattern: /CS0246|The type or namespace '?(\w+)'? could not be found/i,
    title: 'Тип не найден',
    fix: (m) => `Добавь using-директиву или подключи нужный пакет NuGet. Тип: ${m?.[1] || 'неизвестен'}.`,
    example: 'using System.Collections.Generic; // для List<T>',
  },
  {
    pattern: /CS0019|Operator '([^']+)' cannot be applied to operands of type/i,
    title: 'Несовместимые типы операндов',
    fix: () => 'Приведи типы явно: (int)value или используй Convert.ToInt32().',
    example: 'int x = (int)3.14; // явное приведение',
  },
  {
    pattern: /CS0161|not all code paths return a value/i,
    title: 'Не все пути возвращают значение',
    fix: () => 'Убедись, что все ветки if/switch возвращают значение или брось исключение.',
    example: 'throw new NotImplementedException(); // в недостижимой ветке',
  },
  {
    pattern: /NullReferenceException|Object reference not set/i,
    title: 'NullReferenceException — обращение к null',
    fix: () => 'Переменная равна null. Проверь перед использованием или используй оператор ?.',
    example: 'string? name = null;\nConsole.WriteLine(name?.ToUpper() ?? "пусто");',
  },
  {
    pattern: /IndexOutOfRangeException|index was outside/i,
    title: 'IndexOutOfRangeException — выход за границы массива',
    fix: () => 'Индекс >= Length. Проверь границы перед доступом.',
    example: 'if (i >= 0 && i < arr.Length) Console.WriteLine(arr[i]);',
  },
  {
    pattern: /DivideByZeroException|Attempted to divide by zero/i,
    title: 'DivideByZeroException — деление на ноль',
    fix: () => 'Проверь делитель перед операцией.',
    example: 'if (b != 0) result = a / b;',
  },
  {
    pattern: /StackOverflowException|stack overflow/i,
    title: 'StackOverflowException — бесконечная рекурсия',
    fix: () => 'Рекурсивный метод не имеет условия выхода. Добавь базовый случай.',
    example: 'if (n <= 0) return 0; // условие выхода из рекурсии',
  },
  {
    pattern: /FormatException|Input string was not in a correct format/i,
    title: 'FormatException — неверный формат числа',
    fix: () => 'Используй TryParse вместо Parse — он не бросает исключение.',
    example: 'if (int.TryParse(input, out int n)) { /* n готов */ }',
  },
  {
    pattern: /CS1002|; expected/i,
    title: 'Отсутствует точка с запятой',
    fix: () => 'В C# каждый оператор заканчивается точкой с запятой ;',
    example: 'Console.WriteLine("hi"); // <- обязательно',
  },
  {
    pattern: /CS1513|} expected/i,
    title: 'Ожидается закрывающая скобка }',
    fix: () => 'Не закрыт блок кода. Проверь баланс { и }.',
    example: '// каждый { должен иметь пару }',
  },
  {
    pattern: /CS0103|The name '?(\w+)'? does not exist/i,
    title: 'Переменная/метод не существует',
    fix: (m) => `'${m?.[1] || '?'}' не объявлен в этой области видимости. Проверь имя или объяви переменную.`,
    example: 'int myVar = 0; // объяви перед использованием',
  },
  {
    pattern: /Main.*not found|No entry point/i,
    title: 'Не найден метод Main()',
    fix: () => 'Программа должна содержать static void Main() или static int Main() как точку входа.',
    example: 'static void Main() {\n    Console.WriteLine("Start");\n}',
  },
  {
    pattern: /InvalidCastException|Unable to cast/i,
    title: 'InvalidCastException — неверное приведение типов',
    fix: () => 'Используй as для безопасного приведения или is для проверки типа.',
    example: 'if (obj is string s) { Console.WriteLine(s); }',
  },
  {
    pattern: /timeout|timed out|aborted/i,
    title: 'Превышено время выполнения',
    fix: () => 'Программа работала слишком долго. Возможно — бесконечный цикл или рекурсия.',
    example: '// Проверь условие выхода из while/for',
  },
  {
    pattern: /HTTP 429|rate.?limit/i,
    title: 'Превышен лимит API',
    fix: () => 'Онлайн-компилятор ограничил запросы. Попробуй другой движок или Built-in.',
    example: '// Переключись на Built-in или Wandbox',
  },
];

function analyzeErrors(output) {
  const allText = output.map(o => o.v).join('\n');
  const matched = [];
  for (const ep of ERROR_PATTERNS) {
    const m = allText.match(ep.pattern);
    if (m) {
      matched.push({
        title: ep.title,
        fix: ep.fix(m),
        example: ep.example,
      });
    }
  }
  return matched;
}

// ═══════════════════════════════════════════════════════════════════
// BUILT-IN TEACHER — объясняет концепции без внешних API
// ═══════════════════════════════════════════════════════════════════

function teachConcept(id) {
  return CS_CONCEPTS[id] || null;
}

function searchConcepts(query) {
  const q = query.toLowerCase();
  const results = [];
  for (const [id, c] of Object.entries(CS_CONCEPTS)) {
    const score =
      (c.name.toLowerCase().includes(q) ? 3 : 0) +
      (id.toLowerCase().includes(q) ? 2 : 0) +
      (c.tags.some(t => t.toLowerCase().includes(q)) ? 2 : 0) +
      (c.explain.toLowerCase().includes(q) ? 1 : 0) +
      (c.example.toLowerCase().includes(q) ? 1 : 0);
    if (score > 0) results.push({ id, score, ...c });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════
// EXTENDED BUILT-IN INTERPRETER PATCHES
// Дополнительные паттерны для встроенного интерпретатора
// ═══════════════════════════════════════════════════════════════════

// Дополнительные правила трансляции C# → JS для расширенного покрытия
const EXTRA_TRANSPILE_RULES = [
  // LINQ
  [/\.Where\s*\(([^)]+)\)/g,                 '.filter($1)'],
  [/\.Select\s*\(([^)]+)\)/g,                '.map($1)'],
  [/\.OrderBy\s*\(([^)]+)\)/g,               '.sort((a,b) => $1(a) < $1(b) ? -1 : 1)'],
  [/\.OrderByDescending\s*\(([^)]+)\)/g,     '.sort((a,b) => $1(a) > $1(b) ? -1 : 1)'],
  [/\.FirstOrDefault\s*\(([^)]*)\)/g,        '.find($1) ?? null'],
  [/\.First\s*\(\s*\)/g,                     '[0]'],
  [/\.Last\s*\(\s*\)/g,                      '[this.length-1]'],
  [/\.Any\s*\(([^)]+)\)/g,                   '.some($1)'],
  [/\.All\s*\(([^)]+)\)/g,                   '.every($1)'],
  [/\.Sum\s*\(([^)]*)\)/g,                   (_, fn) => fn ? `.reduce((acc,x) => acc + ${fn}(x), 0)` : '.reduce((a,b)=>a+b,0)'],
  [/\.Count\s*\(\s*\)/g,                     '.length'],
  [/\.ToList\s*\(\s*\)/g,                    ''],
  [/\.ToArray\s*\(\s*\)/g,                   ''],
  [/\.Distinct\s*\(\s*\)/g,                  '.filter((v,i,a)=>a.indexOf(v)===i)'],
  [/\.Reverse\s*\(\s*\)/g,                   '.reverse()'],
  [/\.Min\s*\(\s*\)/g,                       '.reduce((a,b)=>Math.min(a,b))'],
  [/\.Max\s*\(\s*\)/g,                       '.reduce((a,b)=>Math.max(a,b))'],
  [/\.Skip\s*\(([^)]+)\)/g,                  '.slice($1)'],
  [/\.Take\s*\(([^)]+)\)/g,                  '.slice(0,$1)'],
  // Nullable
  [/(\w+)\s*\?\.\s*(\w+)/g,                  '$1 == null ? null : $1.$2'],
  [/(\w+)\s*\?\?\s*/g,                       '$1 ?? '],
  // String.IsNullOrEmpty / IsNullOrWhiteSpace
  [/string\.IsNullOrEmpty\s*\(([^)]+)\)/g,   '(!$1 || $1.length === 0)'],
  [/string\.IsNullOrWhiteSpace\s*\(([^)]+)\)/g, '(!$1 || $1.trim().length === 0)'],
  // Ternary
  [/\?(?!\?|\.|\[)/g,                        ' ? '],  // already fine in JS
  // Array methods
  [/Array\.Sort\s*\(([^)]+)\)/g,             '$1.sort((a,b)=>a-b)'],
  [/Array\.Reverse\s*\(([^)]+)\)/g,          '$1.reverse()'],
  [/Array\.IndexOf\s*\(([^,]+),([^)]+)\)/g,  '$1.indexOf($2)'],
];

// Экспортируем для использования в основном файле
window.CS_CONCEPTS_ENGINE = {
  CS_CONCEPTS,
  detectConcepts,
  analyzeErrors,
  teachConcept,
  searchConcepts,
  EXTRA_TRANSPILE_RULES,
};

console.log(`[CS-Engine] Загружено концепций: ${Object.keys(CS_CONCEPTS).length}`);
