class Vec2 {

    constructor(x,y) {
        this.x = x
        this.y = y
    }

    add(Vec2) {
        this.x += Vec2.x
        this.y += Vec2.y
    }

    subtract(Vec2){
        this.x -= Vec2.x
        this.y -= Vec2.y
    }

    dot(Vec2){
        return this.x*Vec2.x + this.y*Vec2.y
    }

    norm(){
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))
    }

    scale(a) {
        this.x *= a
        this.y *= a
    }
}